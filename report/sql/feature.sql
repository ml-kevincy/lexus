-- 4.1 特色段落重視程度 ＋ 5 車型選單使用率（單位：工作階段 × 車款）
WITH base AS ({BASE}),
sv AS (
  SELECT sess, pv, dev, model, section, ts FROM base
  WHERE event_name = 'section_view' AND page_model IS NOT NULL AND model IS NOT NULL AND NOT STARTS_WITH(section, 'home_')
),
units AS (SELECT DISTINCT sess, dev, model FROM sv),
seen AS (SELECT sess, dev, model, section, COUNT(*) AS cnt FROM sv GROUP BY 1, 2, 3, 4),
-- 停留時間：該段落 section_view 到同一次瀏覽中下一個 section_view 的秒數（超過 300 秒視為離開座位，剔除）
--   兩個段落同時進入畫面時會在同一時間送出，所以取「下一個較晚的時間點」，同時送出的段落共用同一段停留時間
svt AS (
  SELECT pv, dev, model, section, ts FROM base
  WHERE event_name = 'section_view' AND page_model IS NOT NULL AND model IS NOT NULL
),
tl AS (SELECT pv, ts, LEAD(ts) OVER (PARTITION BY pv ORDER BY ts) AS next_ts FROM (SELECT DISTINCT pv, ts FROM svt)),
ev AS (SELECT s.dev, s.model, s.section, s.ts, t.next_ts FROM svt s JOIN tl t USING (pv, ts)),
dw AS (
  SELECT dev, model, section, (next_ts - ts) / 1e6 AS sec FROM ev
  WHERE next_ts IS NOT NULL AND (next_ts - ts) / 1e6 <= 300
),
bv AS (
  SELECT sess, dev, model, carousel_id, MAX(banner_index) AS mx FROM base
  WHERE event_name = 'banner_view' AND STARTS_WITH(carousel_id, 'feature_') GROUP BY 1, 2, 3, 4
),
tot AS (
  SELECT model, carousel_id, MAX(banner_index) AS total FROM base
  WHERE event_name = 'banner_view' AND STARTS_WITH(carousel_id, 'feature_') GROUP BY 1, 2
),
vs AS (SELECT DISTINCT sess, model, section FROM base WHERE event_name = 'variant_select'),
agg_units AS (SELECT d, m, COUNT(*) AS units FROM units, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 1, 2),
agg_seen AS (
  SELECT d, m, section, COUNT(*) AS seen, COUNTIF(cnt >= 2) AS rep
  FROM seen, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 1, 2, 3
),
agg_dw AS (
  SELECT d, m, section, APPROX_QUANTILES(sec, 100)[OFFSET(50)] AS dwell
  FROM dw, UNNEST(['all', dev]) AS d, UNNEST(['all', model]) AS m GROUP BY 1, 2, 3
),
agg_cp AS (
  SELECT d, m, s.section, COUNTIF(b.mx >= t.total) AS complete
  FROM seen s
  JOIN bv b ON b.sess = s.sess AND b.model = s.model AND b.carousel_id = s.section
  JOIN tot t ON t.model = b.model AND t.carousel_id = b.carousel_id,
  UNNEST(['all', s.dev]) AS d, UNNEST(['all', s.model]) AS m
  GROUP BY 1, 2, 3
),
agg_vs AS (
  SELECT d, m, s.section, COUNT(*) AS var
  FROM seen s JOIN vs v ON v.sess = s.sess AND v.model = s.model AND v.section = s.section,
  UNNEST(['all', s.dev]) AS d, UNNEST(['all', s.model]) AS m
  GROUP BY 1, 2, 3
)
SELECT a.d AS device, a.m AS model, a.section, u.units, a.seen, a.rep, w.dwell, c.complete, v.var
FROM agg_seen a
JOIN agg_units u USING (d, m)
LEFT JOIN agg_dw w USING (d, m, section)
LEFT JOIN agg_cp c USING (d, m, section)
LEFT JOIN agg_vs v USING (d, m, section)
