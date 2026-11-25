-- Shared base: one row per event on www.lexus.com.tw within the report window.
-- Placeholders filled by build.py: {DATASET} {START} {END}
-- 每個事件多帶一欄 sg（工作階段的流量來源分組）：own＝沒花錢、paid＝花錢；{SG_FILTER} 由 build.py 代入（TRUE／sg = 'own'／sg = 'paid'）
-- 分組規則（以工作階段起始事件的來源判斷）：
--   1. 短網址 ourl.pro、skyurl.cc → own
--   2. 來源開頭為 ES2611（LINE 與廣告組代碼）→ paid
--   3. 來源或媒介含 linelap（LINE 廣告）→ paid
--   4. GA4 預設管道為 Direct、Organic Search、Organic Social、Organic Video、AI Assistant、Referral → own
--   5. 其餘（Paid Search、Display、Paid Social、Cross-network、Paid Other、Mobile Push（Mobile01 廣告）、Unassigned（ES 廣告素材））→ paid
WITH ev AS (
SELECT
  event_name,
  event_timestamp AS ts,
  user_pseudo_id AS uid,
  CONCAT(user_pseudo_id, '.', CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING)) AS sess,
  CONCAT(user_pseudo_id, '.', CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING), '.',
         CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'batch_page_id') AS STRING)) AS pv,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'batch_ordering_id') AS ord,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'batch_event_index') AS eidx,
  IF(device.category = 'mobile', 'mobile', 'desktop') AS dev,  -- tablet and others count as desktop
  REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'^https?://[^/]+(/[^?#]*)') AS path,
  UPPER(REGEXP_EXTRACT((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'), r'^https?://[^/]+/showroom/([^/?#]+)')) AS page_model,
  CASE
    WHEN (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'model') IN ('Lexus Electrified Sport Concept', '雷克薩斯電動運動概念車') THEN 'LESC'
    ELSE (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'model')
  END AS model,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'section') AS section,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'carousel_id') AS carousel_id,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'banner_index') AS banner_index,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'banner_title') AS banner_title,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'entry_point') AS entry_point,
  (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'slide_index') AS slide_index,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_type') AS cta_type,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'cta_location') AS cta_location,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'state') AS state,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'content_in_view') AS content_in_view
FROM `{DATASET}.events_*`
WHERE _TABLE_SUFFIX BETWEEN '{START}' AND '{END}'
  AND RTRIM(NET.HOST((SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location')), '.') = 'www.lexus.com.tw'
),
ss0 AS (
  SELECT
    CONCAT(user_pseudo_id, '.', CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING)) AS sess,
    COALESCE(session_traffic_source_last_click.cross_channel_campaign.default_channel_group, '(null)') AS grp,
    COALESCE(session_traffic_source_last_click.manual_campaign.source, collected_traffic_source.manual_source, '(not set)') AS src,
    COALESCE(session_traffic_source_last_click.manual_campaign.medium, collected_traffic_source.manual_medium, '(not set)') AS med
  FROM `{DATASET}.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '{START}' AND '{END}' AND event_name = 'session_start'
),
ss AS (
  SELECT sess, ANY_VALUE(CASE
    WHEN src IN ('ourl.pro', 'skyurl.cc') THEN 'own'
    WHEN src LIKE 'ES2611%' THEN 'paid'
    WHEN REGEXP_CONTAINS(CONCAT(src, ' ', med), r'(?i)linelap') THEN 'paid'
    WHEN grp IN ('Direct', 'Organic Search', 'Organic Social', 'Organic Video', 'AI Assistant', 'Referral') THEN 'own'
    ELSE 'paid' END) AS sg
  FROM ss0 GROUP BY sess
)
SELECT ev.*, ss.sg FROM ev LEFT JOIN ss USING (sess) WHERE {SG_FILTER}
