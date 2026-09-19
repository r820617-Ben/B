#!/usr/bin/env bash
# Loop Engineering harness
# 用法：loops/run-loop.sh loops/<迴圈名>.md [選項]
#
# 選項：
#   --dry-run            只印提示詞，不呼叫 Claude
#   --input PATH         覆蓋定義檔的 input:
#   --target PATH        這一關要產出的檔案，跑完會檢查它在不在
#   --client 名稱        代入定義檔裡的 {{client}}
#   --date YYYYMMDD      代入 {{date}}，預設今天
#   --state-name 名稱    狀態檔與日誌改用這個名字，讓不同客戶各記各的
#
# 做的事：反覆呼叫 Claude 執行迴圈定義檔裡的目標，每輪跑完由獨立的驗證者
# 判斷有沒有達到停止條件，並用三道護欄（次數、成本、無進展）決定何時停手。

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# ---------- 參數 ----------
LOOP_FILE="${1:-}"; shift || true
DRY_RUN=0
OPT_INPUT=""; OPT_TARGET=""; OPT_CLIENT=""; OPT_DATE=""; OPT_STATE_NAME=""

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)    DRY_RUN=1 ;;
    --input)      OPT_INPUT="${2:-}"; shift ;;
    --target)     OPT_TARGET="${2:-}"; shift ;;
    --client)     OPT_CLIENT="${2:-}"; shift ;;
    --date)       OPT_DATE="${2:-}"; shift ;;
    --state-name) OPT_STATE_NAME="${2:-}"; shift ;;
    *) echo "不認識的選項：$1" >&2; exit 1 ;;
  esac
  shift
done

CLIENT="${OPT_CLIENT:-${LOOP_CLIENT:-}}"
RUN_DATE="${OPT_DATE:-${LOOP_DATE:-$(date '+%Y%m%d')}}"

# {{client}} / {{date}} 代換，讓同一個定義檔跑不同客戶
subst() { printf '%s' "$1" | sed -e "s|{{client}}|$CLIENT|g" -e "s|{{date}}|$RUN_DATE|g"; }

if [ -z "$LOOP_FILE" ] || [ ! -f "$LOOP_FILE" ]; then
  echo "用法：loops/run-loop.sh loops/<迴圈名>.md [--dry-run] [--input PATH] [--client 名稱]" >&2
  echo "可用的迴圈：" >&2
  ls -1 loops/*.md 2>/dev/null | grep -v README >&2
  exit 1
fi

for bin in claude jq; do
  command -v "$bin" >/dev/null 2>&1 || { echo "缺少 $bin，無法執行" >&2; exit 1; }
done

# ---------- 讀迴圈定義 ----------
# frontmatter 夾在頭尾兩行 --- 之間
cfg() {
  awk -v key="$1" '
    NR==1 && $0=="---" { infm=1; next }
    infm && $0=="---" { exit }
    infm {
      split($0, kv, ":")
      k=kv[1]; gsub(/^[ \t]+|[ \t]+$/, "", k)
      if (k==key) {
        sub(/^[^:]*:[ \t]*/, "")
        gsub(/^["'"'"']|["'"'"']$/, "")
        print; exit
      }
    }' "$LOOP_FILE"
}

BODY="$(awk 'NR==1 && $0=="---" {infm=1; next} infm && $0=="---" {infm=0; body=1; next} body || NR==1 && $0!="---"' "$LOOP_FILE")"

NAME="$(cfg name)";                     NAME="${NAME:-$(basename "$LOOP_FILE" .md)}"
MAX_ITER="$(cfg max_iterations)";       MAX_ITER="${MAX_ITER:-5}"
MAX_COST="$(cfg max_cost_usd)";         MAX_COST="${MAX_COST:-2.00}"
NO_PROGRESS_LIMIT="$(cfg no_progress_limit)"; NO_PROGRESS_LIMIT="${NO_PROGRESS_LIMIT:-2}"
VERIFIER="$(cfg verifier)";             VERIFIER="${VERIFIER:-.claude/skills/loop-verifier.md}"
WATCH="$(cfg watch)";                   WATCH="${WATCH:-.}"
PERM_MODE="$(cfg permission_mode)";     PERM_MODE="${PERM_MODE:-acceptEdits}"
INPUT_FILE="$(cfg input)"
MODEL="$(cfg model)"
TARGET_FILE="$(cfg target)"
CALL_TIMEOUT="$(cfg call_timeout_seconds)"; CALL_TIMEOUT="${CALL_TIMEOUT:-600}"

BODY="$(subst "$BODY")"
WATCH="$(subst "$WATCH")"
INPUT_FILE="$(subst "${OPT_INPUT:-$INPUT_FILE}")"
TARGET_FILE="$(subst "${OPT_TARGET:-$TARGET_FILE}")"

STATE_NAME="${OPT_STATE_NAME:-$NAME}"
STATE_FILE="loops/state/${STATE_NAME}.md"
LOG_FILE="loops/state/${STATE_NAME}.log"
COST_FILE="loops/state/${STATE_NAME}.cost"
mkdir -p loops/state

# ---------- 工具 ----------
log() { printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*" | tee -a "$LOG_FILE"; }

fingerprint() {
  { git status --porcelain 2>/dev/null
    git diff HEAD 2>/dev/null
    [ -d "$WATCH" ] && find "$WATCH" -type f -not -path './.git/*' -not -path './loops/state/*' \
      -exec md5sum {} + 2>/dev/null | sort
  } | md5sum | cut -d' ' -f1
}

# run_claude 把原始 JSON 寫到暫存檔，成本和內容在主 shell 解析，
# 避免 command substitution 的子 shell 吃掉變數賦值。
CLAUDE_JSON="$(mktemp)"
trap 'rm -f "$CLAUDE_JSON"' EXIT

run_claude() {  # $1=prompt；成功回 0，失敗回 1
  local prompt="$1"
  local -a args=(-p "$prompt" --output-format json --permission-mode "$PERM_MODE")
  [ -n "$MODEL" ] && args+=(--model "$MODEL")

  : > "$CLAUDE_JSON"
  # 護欄四：單次呼叫逾時。前三道護欄只在兩次呼叫之間檢查，
  # 呼叫本身掛住的話誰都擋不了，所以這裡硬砍。
  timeout "$CALL_TIMEOUT" claude "${args[@]}" < /dev/null > "$CLAUDE_JSON" 2>>"$LOG_FILE"
  local rc=$?
  if [ $rc -eq 124 ]; then
    LAST_COST=0
    log "單次呼叫超過 ${CALL_TIMEOUT}s，砍掉"
    return 2
  fi
  if [ $rc -ne 0 ] || [ ! -s "$CLAUDE_JSON" ]; then
    LAST_COST=0
    return 1
  fi
  LAST_COST="$(jq -r '.total_cost_usd // 0' "$CLAUDE_JSON" 2>/dev/null)"
  case "$LAST_COST" in ''|null) LAST_COST=0 ;; esac
  return 0
}

claude_result() { jq -r '.result // empty' "$CLAUDE_JSON" 2>/dev/null; }

# ---------- 初始化狀態檔 ----------
if [ ! -f "$STATE_FILE" ]; then
  cat > "$STATE_FILE" <<EOF
# 迴圈狀態：$NAME

建立時間：$(date '+%Y-%m-%d %H:%M')

## 進度紀錄
（每輪由迴圈自動追加）
EOF
fi

: > "$LOG_FILE"
log "迴圈開始：$NAME"

INPUT_BLOCK=""
if [ -n "$INPUT_FILE" ]; then
  if [ ! -f "$INPUT_FILE" ]; then
    log "找不到 input 檔：$INPUT_FILE"
    log "用 input: <路徑> 指定這次要處理的輸入，或把該檔案建好再跑"
    exit 1
  fi
  INPUT_BLOCK="$(cat "$INPUT_FILE")"
  log "輸入：$INPUT_FILE"
fi
[ -n "$TARGET_FILE" ] && log "產出：$TARGET_FILE"
[ -n "$CLIENT" ] && log "客戶：$CLIENT"
log "護欄：最多 $MAX_ITER 輪｜成本上限 \$$MAX_COST｜連續 $NO_PROGRESS_LIMIT 輪無進展就停｜單次呼叫上限 ${CALL_TIMEOUT}s"
[ "$DRY_RUN" = 1 ] && log "（dry-run：只印提示詞，不呼叫 Claude）"

TOTAL_COST=0
LAST_COST=0
NO_PROGRESS=0
PREV_FP="$(fingerprint)"
VERDICT_NOTE="（第一輪，尚無驗證意見）"
STOP_REASON="未知"
ITER=0

# ---------- 主迴圈 ----------
while [ "$ITER" -lt "$MAX_ITER" ]; do
  ITER=$((ITER + 1))
  log "─────── 第 $ITER 輪 ───────"

  MAKER_PROMPT="$(cat <<EOF
你正在執行一個自動化迴圈的第 $ITER 輪（最多 $MAX_ITER 輪）。

## 迴圈定義
$BODY

## 這一關要產出的檔案
${TARGET_FILE:-（定義檔沒指定 target，照迴圈定義自己決定路徑）}

## 本次輸入${INPUT_FILE:+（$INPUT_FILE）}
${INPUT_BLOCK:-（這個迴圈沒有指定 input 檔）}

## 目前狀態（外部記憶體：$STATE_FILE）
$(cat "$STATE_FILE")

## 上一輪驗證者的意見
$VERDICT_NOTE

## 這一輪要做的事
針對上面沒過的項目修改，或推進到下一個未完成的步驟。
直接改檔案，改完在 $STATE_FILE 的「進度紀錄」追加一段：這輪做了什麼、看到什麼、還缺什麼。
不要問我要不要繼續，直接做。
EOF
)"

  if [ "$DRY_RUN" = 1 ]; then
    echo "===== 第 $ITER 輪｜生產者提示詞 ====="
    echo "$MAKER_PROMPT"
    STOP_REASON="dry-run 結束"
    break
  fi

  log "生產者執行中…"
  run_claude "$MAKER_PROMPT"; rc=$?
  if [ $rc -eq 2 ]; then
    STOP_REASON="生產者單次呼叫超過 ${CALL_TIMEOUT}s，判定卡住"
    log "$STOP_REASON"
    break
  elif [ $rc -ne 0 ]; then
    STOP_REASON="生產者呼叫失敗，詳見 $LOG_FILE"
    log "$STOP_REASON"
    break
  fi
  TOTAL_COST="$(awk -v a="$TOTAL_COST" -v b="$LAST_COST" 'BEGIN{printf "%.4f", a+b}')"
  log "生產者完成｜本輪 \$$LAST_COST｜累計 \$$TOTAL_COST"

  # 護欄三：無進展偵測
  CUR_FP="$(fingerprint)"
  if [ "$CUR_FP" = "$PREV_FP" ]; then
    NO_PROGRESS=$((NO_PROGRESS + 1))
    log "這輪檔案沒有任何變化（連續 $NO_PROGRESS 次）"
    if [ "$NO_PROGRESS" -ge "$NO_PROGRESS_LIMIT" ]; then
      STOP_REASON="連續 $NO_PROGRESS 輪沒有進展，停手避免空轉"
      log "$STOP_REASON"
      break
    fi
  else
    NO_PROGRESS=0
  fi
  PREV_FP="$CUR_FP"

  # 生產者 / 驗證者分離：另一次獨立呼叫，只看成品
  log "驗證者檢查中…"
  VERIFY_PROMPT="$(cat <<EOF
$(cat "$VERIFIER")

---

## 你要驗的迴圈定義（停止條件在裡面）
$BODY

## 這一關應該產出的檔案
${TARGET_FILE:-（未指定）}

## 這一輪改了哪些檔案
$(git status --porcelain)

$(git diff HEAD 2>/dev/null | head -500)

## 規範檔
請自行讀取 anti-style.md 與 .claude/skills/brand-voice.md，逐條比對。
若迴圈定義指向某個客戶資料夾，也要讀該資料夾的 CLAUDE.md。

現在輸出你的判斷，第一行必須是 VERDICT: PASS 或 VERDICT: FAIL。
EOF
)"

  run_claude "$VERIFY_PROMPT"; rc=$?
  if [ $rc -eq 2 ]; then
    STOP_REASON="驗證者單次呼叫超過 ${CALL_TIMEOUT}s，判定卡住"
    log "$STOP_REASON"
    break
  elif [ $rc -ne 0 ]; then
    STOP_REASON="驗證者呼叫失敗，詳見 $LOG_FILE"
    log "$STOP_REASON"
    break
  fi
  VERDICT_OUT="$(claude_result)"
  TOTAL_COST="$(awk -v a="$TOTAL_COST" -v b="$LAST_COST" 'BEGIN{printf "%.4f", a+b}')"

  {
    echo ""
    echo "### 第 $ITER 輪驗證結果（$(date '+%m-%d %H:%M')）"
    echo "$VERDICT_OUT"
  } >> "$STATE_FILE"

  if printf '%s' "$VERDICT_OUT" | head -3 | grep -q 'VERDICT:[[:space:]]*PASS'; then
    STOP_REASON="驗證通過，停止條件達成"
    log "VERDICT: PASS — $STOP_REASON"
    break
  fi

  log "VERDICT: FAIL — 進入下一輪"
  VERDICT_NOTE="$VERDICT_OUT"

  # 護欄二：成本上限
  if awk -v t="$TOTAL_COST" -v m="$MAX_COST" 'BEGIN{exit !(t >= m)}'; then
    STOP_REASON="累計花費 \$$TOTAL_COST 達到上限 \$$MAX_COST"
    log "$STOP_REASON"
    break
  fi
done

# 護欄一：次數上限
if [ "$ITER" -ge "$MAX_ITER" ] && [ "$STOP_REASON" = "未知" ]; then
  STOP_REASON="跑滿 $MAX_ITER 輪仍未通過驗證，交回人工判斷"
fi

# 通過驗證但檔案不在，等於沒做完
EXIT_CODE=0
case "$STOP_REASON" in
  "驗證通過，停止條件達成")
    if [ -n "$TARGET_FILE" ] && [ ! -f "$TARGET_FILE" ]; then
      STOP_REASON="驗證說通過，但找不到產出檔 $TARGET_FILE"
      EXIT_CODE=1
    fi
    ;;
  "dry-run 結束") ;;
  *) EXIT_CODE=1 ;;
esac

printf '%s' "$TOTAL_COST" > "$COST_FILE"

log "─────── 迴圈結束 ───────"
log "停止原因：$STOP_REASON"
log "共 $ITER 輪｜累計花費 \$$TOTAL_COST"
log "狀態檔：$STATE_FILE"

{
  echo ""
  echo "---"
  echo "## 本次執行總結（$(date '+%Y-%m-%d %H:%M')）"
  echo "- 輪數：$ITER / $MAX_ITER"
  echo "- 花費：\$$TOTAL_COST / \$$MAX_COST"
  echo "- 停止原因：$STOP_REASON"
} >> "$STATE_FILE"

exit $EXIT_CODE
