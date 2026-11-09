-- Shared base: one row per event on www.lexus.com.tw within the report window.
-- Placeholders filled by build.py: {DATASET} {START} {END}
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
