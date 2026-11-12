-- 1 大家怎麼看首頁？分母：首頁頁面瀏覽；分子：看到該段落的首頁瀏覽（同一瀏覽去重）
WITH base AS ({BASE}),
home_pv AS (SELECT DISTINCT pv, dev FROM base WHERE event_name = 'page_view' AND path IN ('/', '/index.aspx', '/index.html') AND ts >= {HOME_LIVE}),
seen AS (SELECT DISTINCT pv, section FROM base WHERE event_name = 'section_view' AND STARTS_WITH(section, 'home_'))
SELECT d AS device, '_pv' AS section, COUNT(*) AS n FROM home_pv, UNNEST(['all', dev]) AS d GROUP BY d
UNION ALL
SELECT d, s.section, COUNT(*) FROM seen s JOIN home_pv h USING (pv), UNNEST(['all', h.dev]) AS d GROUP BY 1, 2
