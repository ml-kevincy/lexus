-- 3 導流入口：各入口點擊數，以及各入口「被看到」的次數（點擊率分母）
WITH base AS ({BASE}),
clicks AS (
  SELECT dev, entry_point AS entry, 'clk' AS kind FROM base
  WHERE event_name = 'select_model' AND model IN ('ES','IS','LS','LBX','UX','NX','RX','LM','RZ','LESC','LF-ZC')
),
den AS (
  SELECT dev, 'home_hero' AS entry, pv FROM base WHERE event_name = 'banner_view' AND carousel_id = 'home_hero'
  UNION DISTINCT
  SELECT dev, 'home_model_list', pv FROM base WHERE event_name = 'section_view' AND section = 'home_model_list'
  UNION DISTINCT
  SELECT dev, 'model_page_recommend', pv FROM base WHERE event_name = 'section_view' AND section = 'recommend' AND page_model IS NOT NULL
  UNION DISTINCT
  SELECT dev, 'model_page_list', pv FROM base WHERE event_name = 'section_view' AND section = 'model_list' AND page_model IS NOT NULL
)
SELECT d AS device, entry, kind, COUNT(*) AS n FROM clicks, UNNEST(['all', dev]) AS d GROUP BY 1, 2, 3
UNION ALL
-- 分母來自新事件的入口：只計上線後的點擊，才能和分母對齊
SELECT d, entry_point, 'clk_live', COUNT(*) FROM base, UNNEST(['all', dev]) AS d
WHERE event_name = 'select_model' AND model IN ('ES','IS','LS','LBX','UX','NX','RX','LM','RZ','LESC','LF-ZC')
  AND ((entry_point = 'menu' AND ts >= {MENU_LIVE}) OR (entry_point = 'home_model_list' AND ts >= {HOME_LIVE}))
GROUP BY 1, 2
UNION ALL
SELECT d, entry, 'den', COUNT(*) FROM den, UNNEST(['all', dev]) AS d GROUP BY 1, 2
UNION ALL
SELECT d, 'menu', 'den', COUNT(*) FROM base, UNNEST(['all', dev]) AS d WHERE event_name = 'menu_open' GROUP BY 1
