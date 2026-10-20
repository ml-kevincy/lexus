# 新版設計（Maze 易用性測試）

依設計稿 PSD 製作的可操作原型，與 `mirror/` 現行官網鏡像一一對應，供 Maze A/B 對照。

| 頁面 | 新版 | 對照（現行） | 來源 |
|---|---|---|---|
| 首頁 | `redesign/` | `mirror/` | idx_0930.psd、idx_mb_1013.psd |
| ES 車款頁 | `redesign/showroom/ES.html` | `mirror/showroom/ES.html` | showroom_0907.psd、showroom_mb_0907.psd |
| 預約試乘 | `redesign/testdrive.html` | `mirror/testdrive.html` | 無新版 PSD，複製現行頁面 |

## 與 PSD 的對應與補足
- 版面、文案、圖片依 PSD；桌機以 1920 寬、手機以 750 寬（@2x）為準，中間尺寸等比縮放。
- 首頁 KV 第 1 格為 PSD 設計，第 2–4 格（RZ、RX、NX）沿用現行官網 KV 影片。
- ES「自訂我的 ES」的車色、內裝、飾板、鋁圈圖片，以及重點配備、規格配備表、充電類常見問答，資料取自現行 ES 頁（`assets/js/es-data.js`，由 `tools/redesign/build_es_data.py` 產生）。
- 「車尾」視角使用現行官網 360 旋轉圖（lexuscdn）。
- 常見問答「購車」第 2–5 題、「保養/保固」為依現行網站資訊整理的暫代文案，需由客戶確認。
- 購車優惠輪播第 2 張為暫代內容（PSD 只有一張）。
- 互動元素皆標 `data-ga-id`，供之後 GA 事件標示頁對應。

## 行為
- 首頁、ES、預約試乘之間互連；其他連結開啟正式站。
- 預約試乘送出為模擬，不會送到 Lexus；無追蹤碼；`noindex`。

## 重新產生
```
python3 tools/redesign/build_es_data.py
python3 tools/redesign/build_testdrive.py
```
PSD 切圖腳本（需 psd-tools 1.11+）：`tools/redesign/psd_inspect.py`、`psd_textless.py`、`psd_assets.py`；PSD 原檔放在 `design/psd/`（不進 git）。
