-- 7.2 推薦組合：來源車款頁（網址）× 被推薦車款（model），分母＝看到「為您推薦」的車款頁瀏覽
WITH base AS ({BASE}),
seen AS (SELECT DISTINCT pv, dev, page_model FROM base WHERE event_name = 'section_view' AND section = 'recommend' AND page_model IS NOT NULL),
clk AS (
  SELECT dev, page_model, model FROM base
  WHERE event_name = 'select_model' AND entry_point = 'model_page_recommend' AND page_model IS NOT NULL
)
SELECT 'seen' AS kind, d AS device, page_model AS src, CAST(NULL AS STRING) AS dst, COUNT(*) AS n
FROM seen, UNNEST(['all', dev]) AS d GROUP BY 2, 3
UNION ALL
SELECT 'clk', d, page_model, model, COUNT(*) FROM clk, UNNEST(['all', dev]) AS d GROUP BY 2, 3, 4
