-- 6 CTA：只計車款頁（/showroom/XX）。FAB 分母＝車款頁瀏覽；頁面內按鈕分母＝看到所在段落的車款頁瀏覽
WITH base AS ({BASE}),
pvs AS (SELECT DISTINCT pv, dev, page_model FROM base WHERE event_name = 'page_view' AND page_model IS NOT NULL),
secpv AS (
  SELECT DISTINCT pv, dev, page_model, section FROM base
  WHERE event_name = 'section_view' AND page_model IS NOT NULL AND section IN ('hero', 'highlight', 'spec_equipment')
),
clk AS (
  SELECT dev, COALESCE(model, page_model) AS model, cta_type, cta_location FROM base
  WHERE event_name = 'cta_click' AND page_model IS NOT NULL
)
SELECT 'pv' AS kind, d AS device, m AS model, CAST(NULL AS STRING) AS k1, CAST(NULL AS STRING) AS k2, COUNT(*) AS n
FROM pvs, UNNEST(['all', dev]) AS d, UNNEST(['all', page_model]) AS m GROUP BY 2, 3
UNION ALL
SELECT 'sec', d, m, section, NULL, COUNT(*) FROM secpv, UNNEST(['all', dev]) AS d, UNNEST(['all', page_model]) AS m GROUP BY 2, 3, 4
UNION ALL
SELECT 'clk', d, m, cta_type, cta_location, COUNT(*) FROM clk, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 2, 3, 4, 5
