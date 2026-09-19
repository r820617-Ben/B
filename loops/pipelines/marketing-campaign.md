---
name: campaign
client:
max_cost_usd: 9.00
---

# 流水線：行銷企劃全流程

從客戶的原始資料，一路跑到團隊可以直接排工作的發文排程表。
每一關各自有驗證者和三道護欄，前一關的產出就是下一關的輸入。
任何一關沒產出檔案就停整條線，修好後用 `--from N` 接著跑。

## 階段
1. loops/brief-loop.md | intake/{{client}}.md | proposals/briefs/{{client}}.md
2. loops/marketing-plan-loop.md | proposals/briefs/{{client}}.md | proposals/{{client}}-{{date}}.md
3. loops/content-loop.md | proposals/{{client}}-{{date}}.md | content/{{client}}-{{date}}/內容總表.md
4. loops/schedule-loop.md | proposals/{{client}}-{{date}}.md | schedules/{{client}}-{{date}}.md

## 第一關的輸入要自己準備
把客戶的原始資料丟進 `intake/<客戶>.md`。會議逐字稿、LINE 對話、客戶來信都可以，
不用整理，亂的也沒關係，第一關就是在做整理。

## 跑法

```bash
loops/run-pipeline.sh loops/pipelines/marketing-campaign.md --client 如記食品
```

卡在某一關就修那一關的產出或定義檔，然後：

```bash
loops/run-pipeline.sh loops/pipelines/marketing-campaign.md --client 如記食品 --from 3
```
