-- 5 車型選單總使用率：看過任一特色段落的工作階段（× 車款）中，至少選過一次車型的比例
WITH base AS ({BASE}),
saw AS (
  SELECT DISTINCT sess, dev, model FROM base
  WHERE event_name = 'section_view' AND page_model IS NOT NULL AND model IS NOT NULL AND STARTS_WITH(section, 'feature_')
),
used AS (SELECT DISTINCT sess, model FROM base WHERE event_name = 'variant_select' AND model IS NOT NULL)
SELECT d AS device, m AS model, COUNT(*) AS saw, COUNTIF(u.sess IS NOT NULL) AS used
FROM saw s LEFT JOIN used u ON u.sess = s.sess AND u.model = s.model,
  UNNEST(['all', s.dev]) AS d, UNNEST(['all', s.model]) AS m
GROUP BY 1, 2
