-- 7.1 舊版選單規格開關：on / off 次數，以及車款介紹選單展開次數（menu_open）
WITH base AS ({BASE})
SELECT d AS device, COALESCE(state, '_menu_open') AS k, COUNT(*) AS n
FROM base, UNNEST(['all', dev]) AS d
WHERE event_name = 'spec_switch' OR event_name = 'menu_open'
GROUP BY 1, 2
UNION ALL
SELECT d, 'on_live', COUNT(*) FROM base, UNNEST(['all', dev]) AS d
WHERE event_name = 'spec_switch' AND state = 'on' AND ts >= {MENU_LIVE}
GROUP BY 1
