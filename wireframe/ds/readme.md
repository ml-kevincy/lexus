# LEXUS 官網 Wireframe · Design System

乾淨灰階線框（clean grayscale wireframe）設計系統，作為 **Lexus Taiwan 官網**（首頁、車款介紹等頁面）wireframe 原型的共用基礎。所有元件以**結構**為導向，深藍灰為唯一強調色，中英混排標注。本系統供消費端專案以一條 `styles.css` ＋ 編譯後的 `_ds_bundle.js` 取用。

> **來源 / Sources**
> - 原始碼：`Lexus官網原型設計/`（File System Access 掛載，唯讀）— 元件總覽 `基礎環境與元件庫.html`、`styles/tokens.css`、`styles/components.css`、`components/`、`guidelines/`。
> - 參考素材：Lexus Taiwan 官網截圖（首頁／車款介紹，桌機與手機版），已存於 `_ref/`。
> 讀者若無上述存取權亦無妨——本專案已將所需內容全數匯入。

---

## 定位

- **保真度**：灰階 wireframe（線框系統），非高保真品牌視覺。
- **用途**：快速搭建官網頁面結構原型、資訊架構討論、RWD 版面驗證。
- **裝置寬度**：手機 390 / 平板 834 / 桌機 1440。RWD 重排不靠 media query，而是由外層 `.wf-canvas[data-device="mobile|tablet|desktop"]` 屬性驅動（方便在固定畫布內切換裝置）。

---

## VISUAL FOUNDATIONS · 視覺基礎

- **色彩**：冷調灰階 7 階（`--wf-paper` 白 → `--wf-ink` `#20242A`），唯一強調色為深藍灰 `--wf-accent` `#2B3B50`（softs：`--wf-accent-soft`、`--wf-accent-line`）。**不使用任何其他彩色**；車色色票（swatches）為唯一例外，且僅作示意。
- **字體**：`IBM Plex Sans` / `IBM Plex Sans TC`（內文與標題）＋ `IBM Plex Mono`（標籤、註解、英文字眼、數據）。Google Fonts 透過 `tokens.css` 的 `@import` 載入。
- **字級**：Eyebrow（mono 11 / 字距 .22em / 全大寫）、H1 44/600、H2 30/600、H3 20/600、Body 15/1.65、Anno（mono 11）。標題字重偏細（300–600），呼應 Lexus 的精緻調性。
- **間距**：4px 基數，`--wf-1`(4) ～ `--wf-9`(96)。
- **圓角**：刻意保持方正——`--wf-r-sm` 2px、`--wf-r` 3px、`--wf-r-lg` 6px；膠囊 `--wf-r-pill` 僅用於 tag、toggle、dots。
- **邊框**：`--wf-line`（預設）、`--wf-line-2`（細分隔）、`--wf-line-strong`（強調，用於圖片佔位框）。卡片一律用 **1px 邊框**界定，不靠陰影。
- **陰影**：幾乎不用。僅畫布（`.wf-canvas`）有一層大型柔和投影營造「紙張浮於檯面」之感；其餘元件零陰影。
- **背景**：頁面底為 `--wf-stage` 灰；內容面為 `--wf-paper` 白。**無漸層、無材質**；斜線 hatch（`repeating-linear-gradient 45°`）僅用於「佔位／裝飾區」的表面（如 wordmark 帶、佔位圖）。NEWS 與規格表區段以 `--wf-stage` 灰底與內容區做出節奏。
- **圖片**：一律用佔位框（hatch + 對角線 X + mono 標籤膠囊），三種變體：`default`（淺）、`dark`（深，售後／影片／hero）、`plain`（細斜紋，背景圖）。**不放真實照片、不手繪 SVG 插圖**。
- **Hover**：邊框變深（line → ink）、文字變深、primary 鈕加深一階（accent → accent-700）、導覽連結出現 2px 底線。轉場 `.15s`，無彈跳。
- **Press / Active**：以顏色加深表達（如 secondary 鈕反白為 ink 底白字），不縮放。
- **動畫**：極少。只有畫布寬度切換的 `.28s ease` 過渡；**無進場動畫、無無限循環動效**。
- **透明與模糊**：原則上不使用（hero 疊字所需的半透明遮罩除外）。
- **佈局**：內容最大寬 `--wf-maxw` 1200px（`.wf-container`）；網格用 `.wf-grid-2` / `.wf-grid-3`（mobile 收為 1 欄、tablet 3→2 欄）。

---

## RWD 原則 · Responsive Principles

**Mobile-first**：以手機為基準樣式（無前綴），往上用 `min-width` 疊加。斷點規範如下，與 token `--wf-bp-md` / `--wf-bp-lg` 對應：

| 裝置 | 寬度範圍 | 前綴 | 代表預覽寬度 |
|---|---|---|---|
| 手機 Mobile | `< 768px` | base（不需前綴） | 390 |
| 平板 Tablet | `768px – 1023px` | `md:` （≥768px） | 834 |
| 桌機 Desktop | `≥ 1024px` | `lg:` （≥1024px） | 1440 |

**兩種觸發來源（效果一致）**
1. **固定畫布預覽**：`.wf-canvas[data-device="mobile|tablet|desktop"]` —— 在 1440 畫布內模擬各裝置重排，**不受瀏覽器實際寬度影響**（wireframe 與 UI kits 採此法，右下 Tweaks 切換）。
2. **真實 RWD 頁面**：`styles/rwd.css` 內的 `@media (min-width: 768px / 1024px)` 規則；版面容器加上 `.wf-rwd` 即可讓 `.wf-grid-2/3` 在真實視窗下重排。

**核心重排規則**
- **網格**：`.wf-grid-3` → 手機 1 欄 · 平板 2 欄 · 桌機 3 欄；`.wf-grid-2` → 手機 1 欄 · 平板↑ 2 欄。內容最大寬 `--wf-maxw` 1200px 置中。
- **Header**：桌機完整橫向導覽；平板縮短間距、隱藏 `LEXUS MY FILM`；手機收合為漢堡 `.wf-burger`，導覽改抽屜。
- **Footer**：車型／連結欄 5 → 平板 3 → 手機 2 欄。
- **字級**：display 字（H1 44 / SectionTitle word 40）在手機降一階（如 word → 30），避免溢出。
- **間距**：`.wf-container` 左右留白 40 → 平板 28 → 手機 18；區段上下 padding 隨之縮減。
- **觸控**：手機可點目標 ≥ 44px（按鈕 42–44、icon 32 命中區外擴）。
- **圖片**：以 `aspect-ratio` 維持比例自適應，不固定高度。

**可見性工具**（`rwd.css`）：`.wf-only-mobile` / `.wf-only-tablet` / `.wf-only-desktop`、`.wf-hide-mobile` / `.wf-hide-desktop`——畫布內依 `data-device`、真實頁面依 `@media` 同時生效。

---

## CONTENT FUNDAMENTALS · 內容準則

- **中英混排**：結構性標籤一律用**英文 mono 全大寫**（如 `HERO IMAGE`、`MODEL 16:9`、`MAX POWER`、`SPECIFICATIONS`）；實際內容用**繁體中文**（如「由你 自定未來」「全擎化體驗」）。
- **語氣**：精煉、克制、帶高級感的宣告句。第二人稱以「您」稱呼讀者（如「為您打造更多元的動力選擇」）。**不用驚嘆號、不用 emoji**。
- **標題**：偏好短句留白；中文標題常以全形空格拉開字距（如「售 後 服 務」）。
- **註解**：mono 11px，可用 `//` 前綴，例：`// 標籤與規格註解使用等寬字`。
- **數據**：mono 或 `tabular-nums`，例：`309 PS`、`284.5`、`NT$ 179 ~ 284.5 萬`。
- **品牌字標**：`EXPERIENCE AMAZING`、`AMAZING LEXUS` 以 outline / 細體 mono 大字呈現（Wordmark 元件）。

---

## ICONOGRAPHY · 圖示系統

線框階段**沒有 icon font、沒有 SVG icon 集**，刻意以低保真符號表達，待升級高保真時再替換：

- **圓框 + mono 縮寫文字**（`.wf-icon`）：如 `LINE`、`AI`、`會員`、`L`、`f`、`◎`、`▶`（footer 社群）。
- **Unicode 功能符號**：`▾`（下拉）、`‹ ›`（箭頭）、`↓`（下載）、`✉`（信件）、`▶`（播放）、`↗`（外連）、`◧ ▣ ◎ ◔ ◫`（tab rail 佔位 icon）。
- **Logo**：一律用 `LOGO` 佔位框（`.wf-logo`），**不得使用真實 Lexus 商標**。
- **車色**：以圓形色票（`.wf-swatch`）表示，是系統中唯一帶彩的元素。

> 升級為高保真時，請以真實 icon 資產（建議同一套線性 icon set）替換上述佔位，並換上 `LOGO` 處的官方 Spindle 商標。

---

## 元件索引 · Components

CSS class 全部以 `wf-` 前綴；React 元件（`components/`）為其薄封裝，編譯後掛載於 `window.LexusWireframeDesignSystem_ea4c01`（namespace 由編譯器產生，以 `check_design_system` 查證）。

| 群組 | 元件 | 說明 |
|---|---|---|
| `components/core/` | `Button` | primary / secondary / ghost / film；sm；block；可帶箭頭 |
| | `Tag` | outline（預設）/ solid / ink |
| | `TextLink` | mono 大寫文字連結（READ →） |
| | `Swatches` | 車色圓形色票列 |
| | `Select` | 下拉選單（佔位） |
| | `Toggle` | 膠囊開關（360° 賞車） |
| | `Dots` | 輪播圓點分頁 |
| | `Arrows` | 圓形前後箭頭 |
| `components/navigation/` | `Header` | 全站導覽列（mobile 收合為漢堡） |
| | `Tabs` | 底線式分頁籤 |
| | `TabRail` | icon 分頁列（外觀／格柵／燈組…） |
| | `Footer` | 車型總覽 + 連結欄 + 版權列 |
| `components/cards/` | `NewsCard` | 新聞卡（圖 + tag + 日期 + 標題 + READ） |
| | `ModelCard` | 車款卡（圖 + 車名 + 動力 + CTA） |
| | `StatTile` | 重點數據磚（icon + 標籤 + 數值） |
| `components/content/` | `ImagePlaceholder` | 圖片佔位（default / dark / plain，任意比例） |
| | `SectionTitle` | 區塊標題（EN 大字／outline + 中文） |
| | `Wordmark` | EXPERIENCE AMAZING outline 字標 |
| | `SpecTable` | 規格表（tab + 對照欄 + 可收合列） |

---

## UI Kits · 全頁線框

| 路徑 | 頁面 | 內容 |
|---|---|---|
| `ui_kits/home/index.html` | **首頁 Homepage** | Hero（疊字＋側邊 rail）、AMAZING LEXUS、售後服務、NEWS、點數回饋、EXPERIENCE AMAZING ＋ 車型總覽、Footer |
| `ui_kits/model/index.html` | **車款介紹 Model** | Hero（NX）、規格亮點面板、DESIGN tab rail、車色、Driving Signature、Safety 3.0、規格表、為您推薦、Footer |

兩者皆內建右下角 **Tweaks** 面板可切換手機／平板／桌機即時預覽重排。Model 頁的 tab rail、規格表分頁與可收合列為可點互動。

---

## 使用方式 · Usage

1. 連結全域樣式：`<link rel="stylesheet" href="styles.css">`（會載入 tokens + components + 字體）。
2. 取用 React 元件：載入 `_ds_bundle.js` 後，`const { Button, Header } = window.LexusWireframeDesignSystem_ea4c01`。
3. 或直接以 `wf-` class 寫靜態標記（與 React 元件視覺一致）——UI kits 即採此法以確保零相依。
4. 頁面結構建議：`.wf-stage` ＞ `.wf-canvas[data-device]` ＞ 內容；切換 `data-device` 預覽三種裝置。
5. 新頁面可從 `templates/lexus-page/` 起手。

---

## 檔案索引 · Manifest

- `styles.css` — 全域樣式進入點（`@import` tokens、components）
- `styles/tokens.css` — design tokens（色彩／字體／間距／圓角／字體 `@import`）
- `styles/components.css` — 全部 `wf-` 元件樣式
- `styles/rwd.css` — RWD 斷點、可見性工具、真實視窗重排規則
- `guidelines/` — Foundations specimen 卡片（Design System 分頁顯示）
- `components/<group>/` — React 元件（`.jsx` + `.d.ts` + `.prompt.md`）與各群組展示卡
- `ui_kits/home/`、`ui_kits/model/` — 全頁線框 UI kits
- `templates/lexus-page/` — 可複製的空白頁面起手樣板
- `基礎環境與元件庫.html` — 完整元件總覽展示頁（含裝置切換 Tweaks）
- `_ref/` — 官網參考截圖
- `SKILL.md` — Agent Skill 入口
