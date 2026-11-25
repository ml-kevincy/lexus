-- 4.2 段落瀏覽順序：每次車款頁瀏覽中，各段落第一次 section_view 的先後
-- 注意：同一批送出的事件時間戳記完全相同（batch_event_index 全部是空的，batch_ordering_id 只排批次、不排批次內的事件），
--       所以同一時間出現的段落沒有先後之分；只拿「時間較早」與「時間較晚」的段落比較，並排除只有同一個時間點的瀏覽。
WITH base AS ({BASE}),
rk AS (
  SELECT * FROM UNNEST([
    STRUCT('hero' AS s, 1 AS r), ('highlight', 2), ('feature_exterior', 3), ('feature_color', 4), ('feature_interior', 5),
    ('feature_performance', 6), ('feature_safety', 7), ('feature_charging', 8), ('link_plus', 9), ('faq', 10),
    ('spec_equipment', 11), ('recommend', 12), ('model_list', 13)])
),
firsts AS (
  SELECT pv, ANY_VALUE(dev) AS dev, ANY_VALUE(model) AS model, section, MIN(ts) AS t
  FROM base WHERE event_name = 'section_view' AND page_model IS NOT NULL AND model IS NOT NULL
  GROUP BY pv, section
),
fr AS (SELECT f.*, r.r FROM firsts f JOIN rk r ON r.s = f.section),
multi AS (SELECT pv FROM fr GROUP BY pv HAVING COUNT(DISTINCT t) >= 2),
pv_info AS (SELECT fr.pv, ANY_VALUE(dev) AS dev, ANY_VALUE(model) AS model FROM fr JOIN multi USING (pv) GROUP BY fr.pv),
inv AS (
  SELECT a.pv, ANY_VALUE(a.dev) AS dev, ANY_VALUE(a.model) AS model, a.section AS later,
    ARRAY_AGG(b.section ORDER BY b.t DESC, b.r DESC LIMIT 1)[OFFSET(0)] AS earlier
  FROM fr a JOIN multi m ON m.pv = a.pv JOIN fr b ON b.pv = a.pv AND b.t < a.t AND b.r > a.r
  GROUP BY a.pv, a.section
),
inv_pv AS (SELECT DISTINCT pv FROM inv)
SELECT d AS device, m AS model, '_pv' AS path, COUNT(*) AS n, COUNTIF(i.pv IS NOT NULL) AS inv
FROM pv_info p LEFT JOIN inv_pv i USING (pv), UNNEST(['all', p.dev]) AS d, UNNEST(['all', p.model]) AS m
GROUP BY 1, 2
UNION ALL
SELECT d, m, CONCAT(earlier, '>', later), COUNT(*), NULL
FROM inv, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m
GROUP BY 1, 2, 3
