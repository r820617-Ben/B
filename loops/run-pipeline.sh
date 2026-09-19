#!/usr/bin/env bash
# Loop Engineering pipeline runner
# 用法：loops/run-pipeline.sh loops/pipelines/<流水線>.md [選項]
#
# 選項：
#   --client 名稱     覆蓋流水線定義裡的 client
#   --date YYYYMMDD   覆蓋日期，預設今天
#   --from N          從第 N 關開始跑（前面幾關的產出已經在了）
#   --only N          只跑第 N 關
#   --dry-run         每一關都只印提示詞
#
# 做的事：依序跑多個迴圈，前一關的產出就是下一關的輸入。
# 任何一關沒產出檔案就停整條線，並在總帳上寫清楚卡在哪一關。

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

PIPE_FILE="${1:-}"; shift || true
OPT_CLIENT=""; OPT_DATE=""; FROM=1; ONLY=0; DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --client)  OPT_CLIENT="${2:-}"; shift ;;
    --date)    OPT_DATE="${2:-}"; shift ;;
    --from)    FROM="${2:-1}"; shift ;;
    --only)    ONLY="${2:-0}"; shift ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "不認識的選項：$1" >&2; exit 1 ;;
  esac
  shift
done

if [ -z "$PIPE_FILE" ] || [ ! -f "$PIPE_FILE" ]; then
  echo "用法：loops/run-pipeline.sh loops/pipelines/<流水線>.md [--client 名稱]" >&2
  echo "可用的流水線：" >&2
  ls -1 loops/pipelines/*.md 2>/dev/null >&2
  exit 1
fi

cfg() {
  awk -v key="$1" '
    NR==1 && $0=="---" { infm=1; next }
    infm && $0=="---" { exit }
    infm {
      split($0, kv, ":")
      k=kv[1]; gsub(/^[ \t]+|[ \t]+$/, "", k)
      if (k==key) { sub(/^[^:]*:[ \t]*/, ""); gsub(/^["'"'"']|["'"'"']$/, ""); print; exit }
    }' "$PIPE_FILE"
}

PIPE_NAME="$(cfg name)"; PIPE_NAME="${PIPE_NAME:-$(basename "$PIPE_FILE" .md)}"
CLIENT="${OPT_CLIENT:-$(cfg client)}"
RUN_DATE="${OPT_DATE:-$(date '+%Y%m%d')}"
PIPE_MAX_COST="$(cfg max_cost_usd)"; PIPE_MAX_COST="${PIPE_MAX_COST:-10.00}"

if [ -z "$CLIENT" ]; then
  echo "沒有指定客戶。用 --client 名稱，或在流水線定義的 client: 填好。" >&2
  exit 1
fi

subst() { printf '%s' "$1" | sed -e "s|{{client}}|$CLIENT|g" -e "s|{{date}}|$RUN_DATE|g"; }

# 階段行格式： 1. <迴圈定義> | <輸入> | <產出>
mapfile -t STAGES < <(grep -E '^[0-9]+\.[[:space:]].*\|.*\|' "$PIPE_FILE")
TOTAL_STAGES=${#STAGES[@]}
if [ "$TOTAL_STAGES" -eq 0 ]; then
  echo "流水線定義裡找不到階段。格式：1. loops/xxx-loop.md | 輸入路徑 | 產出路徑" >&2
  exit 1
fi

LEDGER="loops/state/pipeline-${PIPE_NAME}-${CLIENT}.md"
mkdir -p loops/state intake proposals/briefs content schedules

plog() { printf '%s  %s\n' "$(date '+%H:%M:%S')" "$*"; }

{
  echo ""
  echo "## 執行：$(date '+%Y-%m-%d %H:%M')"
  echo "- 客戶：$CLIENT"
  echo "- 日期代號：$RUN_DATE"
  echo "- 總成本上限：\$$PIPE_MAX_COST"
} >> "$LEDGER"

plog "════ 流水線：$PIPE_NAME ════"
plog "客戶：$CLIENT｜日期：$RUN_DATE｜共 $TOTAL_STAGES 關｜總上限 \$$PIPE_MAX_COST"
[ "$DRY_RUN" = 1 ] && plog "（dry-run）"

PIPE_COST=0
FAILED_STAGE=0

for i in $(seq 1 "$TOTAL_STAGES"); do
  line="${STAGES[$((i-1))]}"
  loop_def="$(subst "$(echo "$line" | sed -E 's/^[0-9]+\.[[:space:]]*//' | cut -d'|' -f1 | xargs)")"
  stage_in="$(subst "$(echo "$line" | cut -d'|' -f2 | xargs)")"
  stage_out="$(subst "$(echo "$line" | cut -d'|' -f3 | xargs)")"
  loop_name="$(basename "$loop_def" .md)"

  if [ "$ONLY" -gt 0 ] && [ "$i" -ne "$ONLY" ]; then continue; fi
  if [ "$ONLY" -eq 0 ] && [ "$i" -lt "$FROM" ]; then
    plog "第 $i 關 $loop_name — 跳過（--from $FROM）"
    continue
  fi

  echo ""
  plog "──── 第 $i / $TOTAL_STAGES 關：$loop_name ────"
  plog "輸入 $stage_in"
  plog "產出 $stage_out"

  if [ ! -f "$loop_def" ]; then
    plog "找不到迴圈定義 $loop_def，停整條線"
    FAILED_STAGE=$i; break
  fi
  if [ ! -f "$stage_in" ]; then
    plog "找不到輸入檔 $stage_in"
    [ "$i" -eq 1 ] && plog "第一關的輸入要自己準備，把客戶原始資料放進去再跑"
    FAILED_STAGE=$i; break
  fi
  if [ -f "$stage_out" ]; then
    plog "產出檔已存在，這一關會在既有內容上修，不是重寫"
  fi

  args=(--input "$stage_in" --target "$stage_out" --client "$CLIENT" --date "$RUN_DATE"
        --state-name "${PIPE_NAME}-${i}-${loop_name}-${CLIENT}")
  [ "$DRY_RUN" = 1 ] && args+=(--dry-run)

  loops/run-loop.sh "$loop_def" "${args[@]}"
  rc=$?

  cost_file="loops/state/${PIPE_NAME}-${i}-${loop_name}-${CLIENT}.cost"
  stage_cost="$(cat "$cost_file" 2>/dev/null)"; stage_cost="${stage_cost:-0}"
  PIPE_COST="$(awk -v a="$PIPE_COST" -v b="$stage_cost" 'BEGIN{printf "%.4f", a+b}')"

  stop_reason="$(grep '停止原因：' "loops/state/${PIPE_NAME}-${i}-${loop_name}-${CLIENT}.log" 2>/dev/null | tail -1 | sed 's/.*停止原因：//')"

  {
    echo "  - 第 $i 關 $loop_name：$([ $rc -eq 0 ] && echo 通過 || echo 卡住)"
    echo "    - 產出：$stage_out"
    echo "    - 停止原因：${stop_reason:-未記錄}"
    echo "    - 花費：\$$stage_cost"
  } >> "$LEDGER"

  if [ $rc -ne 0 ]; then
    plog "第 $i 關沒過：${stop_reason:-未記錄}"
    FAILED_STAGE=$i; break
  fi
  plog "第 $i 關通過｜本關 \$$stage_cost｜累計 \$$PIPE_COST"

  if awk -v t="$PIPE_COST" -v m="$PIPE_MAX_COST" 'BEGIN{exit !(t >= m)}'; then
    plog "累計 \$$PIPE_COST 達到總上限 \$$PIPE_MAX_COST，停在第 $i 關"
    FAILED_STAGE=$((i + 1)); break
  fi
done

echo ""
plog "════ 流水線結束 ════"
if [ "$FAILED_STAGE" -eq 0 ]; then
  plog "全部 $TOTAL_STAGES 關通過｜總花費 \$$PIPE_COST"
  RESULT="全部通過"
else
  plog "卡在第 $FAILED_STAGE 關｜總花費 \$$PIPE_COST"
  plog "修好後接著跑：loops/run-pipeline.sh $PIPE_FILE --client $CLIENT --date $RUN_DATE --from $FAILED_STAGE"
  RESULT="卡在第 $FAILED_STAGE 關"
fi
plog "總帳：$LEDGER"

{
  echo "  - 結果：$RESULT"
  echo "  - 總花費：\$$PIPE_COST / \$$PIPE_MAX_COST"
} >> "$LEDGER"

[ "$FAILED_STAGE" -eq 0 ] || exit 1
