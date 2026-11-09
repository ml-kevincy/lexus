-- 4.2 段落瀏覽順序：每次車款頁瀏覽中，各段落第一次 section_view 的先後
WITH base AS ({BASE}),
rk AS (
  SELECT * FROM UNNEST([
    STRUCT('hero' AS s, 1 AS r), ('highlight', 2), ('feature_exterior', 3), ('feature_color', 4), ('feature_interior', 5),
    ('feature_performance', 6), ('feature_safety', 7), ('feature_charging', 8), ('link_plus', 9), ('faq', 10),
    ('spec_equipment', 11), ('recommend', 12), ('model_list', 13)])
),
firsts AS (
  SELECT pv, ANY_VALUE(dev) AS dev, ANY_VALUE(model) AS model, section, ARRAY_AGG(STRUCT(ts, ord, eidx) ORDER BY ts, ord, eidx LIMIT 1)[OFFSET(0)] AS t
  FROM base WHERE event_name = 'section_view' AND page_model IS NOT NULL AND model IS NOT NULL
  GROUP BY pv, section
),
lagged AS (
  SELECT f.pv, f.dev, f.model, f.section, r.r,
    LAG(f.section) OVER w AS prev_s, LAG(r.r) OVER w AS prev_r,
    COUNT(*) OVER (PARTITION BY f.pv) AS n_sec
  FROM firsts f JOIN rk r ON r.s = f.section
  WINDOW w AS (PARTITION BY f.pv ORDER BY f.t.ts, f.t.ord, f.t.eidx)
),
pvs AS (
  SELECT pv, ANY_VALUE(dev) AS dev, ANY_VALUE(model) AS model, LOGICAL_OR(r < prev_r) AS inv
  FROM lagged WHERE n_sec >= 2 GROUP BY pv
),
skips AS (SELECT DISTINCT pv, dev, model, CONCAT(prev_s, '>', section) AS path FROM lagged WHERE r < prev_r)
SELECT d AS device, m AS model, '_pv' AS path, COUNT(*) AS n, COUNTIF(inv) AS inv
FROM pvs, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 1, 2
UNION ALL
SELECT d, m, path, COUNT(*), NULL
FROM skips, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 1, 2, 3
