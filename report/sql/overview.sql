-- 0 總覽：工作階段、使用者、頁面瀏覽（依裝置）
WITH base AS ({BASE})
SELECT d AS device,
  COUNT(DISTINCT sess) AS sessions,
  COUNT(DISTINCT uid) AS users,
  COUNTIF(event_name = 'page_view') AS pageviews,
  COUNTIF(content_in_view IS NOT NULL) AS civ
FROM base, UNNEST(['all', dev]) AS d
GROUP BY d
