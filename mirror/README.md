# 現行官網鏡像（易用性測試用）

擷取自 www.lexus.com.tw，僅供內部 Maze 易用性測試，請勿公開散佈。

| 頁面 | 原始網址 | 鏡像 |
|---|---|---|
| 首頁 | https://www.lexus.com.tw/ | `mirror/index.html` |
| NX 車款頁 | https://www.lexus.com.tw/showroom/NX | `mirror/showroom/NX.html` |
| ES 車款頁 | https://www.lexus.com.tw/showroom/ES | `mirror/showroom/ES.html` |
| 預約試乘 | https://www.lexus.com.tw/testdrive.aspx | `mirror/testdrive.html` |

## 與正式站的差異
- 已移除 GTM／GA／FB／Appier／LINE 等追蹤碼，並以 CSP 只允許必要腳本來源，避免測試流量進入 Lexus 正式數據。
- 鏡像頁之間互相連結皆指向鏡像；其他連結開啟正式站。
- API（規格表、車款、據點）改讀 `_api/` 內的擷取快照。
- 預約試乘送出為模擬：不會送到 Lexus，直接顯示依填寫內容產生的成功畫面。
- 頁面加上 `noindex`。

## 重新擷取
```
cd tools/mirror && npm i && npm run capture
```
腳本會覆寫 `mirror/` 內的檔案（不會刪除舊檔）。要加頁面，編輯 `tools/mirror/capture.mjs` 的 `PAGES`。
