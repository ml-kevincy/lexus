-- 2 首頁輪播：曝光（每次瀏覽每張一次）與點擊
WITH base AS ({BASE}),
home_pv AS (SELECT DISTINCT pv, dev FROM base WHERE event_name = 'page_view' AND path IN ('/', '/index.aspx', '/index.html')),
exp AS (SELECT DISTINCT pv, banner_index, banner_title FROM base WHERE event_name = 'banner_view' AND carousel_id = 'home_hero'),
clk AS (SELECT pv, slide_index FROM base WHERE event_name = 'select_model' AND entry_point = 'home_hero')
SELECT d AS device, 'pv' AS kind, CAST(NULL AS INT64) AS idx, CAST(NULL AS STRING) AS title, COUNT(*) AS n
FROM home_pv, UNNEST(['all', dev]) AS d GROUP BY d
UNION ALL
SELECT d, 'exp', e.banner_index, e.banner_title, COUNT(*) FROM exp e JOIN home_pv h USING (pv), UNNEST(['all', h.dev]) AS d GROUP BY 1, 2, 3, 4
UNION ALL
SELECT d, 'clk', c.slide_index, CAST(NULL AS STRING), COUNT(*) FROM clk c JOIN home_pv h USING (pv), UNNEST(['all', h.dev]) AS d GROUP BY 1, 2, 3, 4
