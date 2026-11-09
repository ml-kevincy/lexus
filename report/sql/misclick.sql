-- 4.2 切換標籤誤點：特色輪播的點擊中，點擊當下輪播不在畫面內的比例
-- content_in_view 上線後直接用；之前用推測：點擊前最後一個 section_view 已是頁面上更下面的段落
WITH base AS ({BASE}),
rk AS (
  SELECT * FROM UNNEST([
    STRUCT('hero' AS s, 1 AS r), ('highlight', 2), ('feature_exterior', 3), ('feature_color', 4), ('feature_interior', 5),
    ('feature_performance', 6), ('feature_safety', 7), ('feature_charging', 8), ('link_plus', 9), ('faq', 10),
    ('spec_equipment', 11), ('recommend', 12), ('model_list', 13)])
),
ev AS (
  SELECT pv, dev, model, event_name, section, carousel_id, banner_index, content_in_view, ts, ord, eidx FROM base
  WHERE page_model IS NOT NULL AND model IS NOT NULL
    AND (event_name = 'section_view' OR (event_name = 'banner_view' AND STARTS_WITH(carousel_id, 'feature_')))
),
seq AS (
  SELECT *,
    LAST_VALUE(IF(event_name = 'section_view', section, NULL) IGNORE NULLS)
      OVER (PARTITION BY pv ORDER BY ts, ord, eidx ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS last_sec,
    ROW_NUMBER() OVER (PARTITION BY pv, carousel_id ORDER BY ts, ord, eidx) AS bv_n
  FROM ev
),
last_seen AS (SELECT pv, section, MAX(ts) AS last_ts FROM ev WHERE event_name = 'section_view' GROUP BY 1, 2),
clk AS (
  SELECT q.pv, q.dev, q.model, q.carousel_id, q.ts,
    COALESCE(q.content_in_view = 'no', q.last_sec IS NOT NULL AND q.last_sec != q.carousel_id AND r1.r > r2.r) AS mis
  FROM seq q
  LEFT JOIN rk r1 ON r1.s = q.last_sec
  LEFT JOIN rk r2 ON r2.s = q.carousel_id
  WHERE q.event_name = 'banner_view' AND NOT (q.bv_n = 1 AND q.banner_index = 1)
)
SELECT d AS device, m AS model, c.carousel_id AS section,
  COUNT(*) AS clicks,
  COUNTIF(c.mis) AS mis,
  COUNTIF(c.mis AND l.last_ts > c.ts) AS mis_back
FROM clk c
LEFT JOIN last_seen l ON l.pv = c.pv AND l.section = c.carousel_id,
UNNEST(['all', c.dev]) AS d, UNNEST(['all', c.model]) AS m
GROUP BY 1, 2, 3
