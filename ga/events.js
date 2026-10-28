/* GA4 自訂事件庫（依「Lexus官網_GA4自訂事件埋設規劃」草稿 v0.1）。
   標記放在頁面的哪裡，由人在標示頁上直接畫出來（存在 annotations.json）；這個檔案只放事件本身的內容。
   evt.params：事件帶的參數，順序即程式碼順序。help：參數的可用值（any）與動態值說明（dyn）。 */
window.GA_DATA = {
  measurementId: 'G-4DVH5EF2RM',

  rules: [
    '所有自訂事件都要加 send_to，指定研究用 GA4 資源的評估 ID，避免誤送到媒體代理商的資源。',
    '測試站與正式站使用不同的評估 ID，避免測試與正式數據混在一起：測試站用 G-44JHMQTYPM（測試用資料串流），正式站用 G-4DVH5EF2RM。頁面上的程式碼範本預設為正式站的 ID。',
    '參數固定值只能使用規格列出的值，新增值需先更新規格。model 一律用車款代號（ES、NX、RX…）。',
    '正式站對應元件加上 data-track 屬性並填入事件名稱，監測期結束後搜尋此屬性即可完整移除。',
    '參數需在 GA4 後台登錄為自訂維度（目前共 10 個）。',
  ],

  pages: {
    home:      { label: '首頁',     url: { mirror: '../mirror/',                     redesign: '../redesign/' } },
    menu:      { label: '選單（舊版）', url: { mirror: '../mirror/?ga=menu' } },
    es:        { label: 'ES 車款頁', url: { mirror: '../mirror/showroom/ES.html',     redesign: '../redesign/showroom/ES.html' } },
  },

  help: {
    model:            { any: ['ES', 'IS', 'LS', 'LBX', 'UX', 'NX', 'RX', 'LM', 'RZ', 'LESC', 'LF-ZC'], dyn: '依頁面或按鈕所屬的車款帶入代號', opt: true, note: '車款代號：\nES、IS、LS（SEDAN）\nLBX、UX、NX、RX、LM（SUV/MPV）\nRZ（BEV）\nLESC＝Lexus Electrified Sport Concept（CONCEPT）\nLF-ZC（CONCEPT）' },
    entry_point:      { any: ['menu', 'home_hero', 'home_model_list', 'model_page_recommend', 'model_page_list'], note: '對應入口：\nmenu＝主選單：車款介紹中的所有車款\nhome_hero＝首頁：封面輪播\nhome_model_list＝首頁：底部車款列表\nmodel_page_recommend＝車款介紹頁：底部為您推薦\nmodel_page_list＝車款介紹頁：底部車款列表' },
    cta_type:         { any: ['offer', 'test_drive', 'find_dealer', 'tech_showcase', 'recommend', 'catalog_download', 'compare'], note: '對應按鈕：\noffer＝購車優惠（FAB）\ntest_drive＝試乘諮詢（FAB、車款介紹頁）\nfind_dealer＝據點查詢（FAB）\ntech_showcase＝科技展演（FAB）\nrecommend＝為您推薦（車款介紹頁）\ncatalog_download＝下載型錄（車款介紹頁）\ncompare＝前往全車系比較（車款介紹頁底部）' },
    cta_location:     { any: ['fab', 'page'], note: 'fab＝左方 FAB 的按鈕\npage＝頁面內容裡的按鈕' },
    section:          { any: ['hero', 'highlight', 'feature_exterior', 'feature_color', 'feature_interior', 'feature_performance', 'feature_safety', 'feature_charging', 'link_plus', 'faq', 'spec_equipment', 'recommend', 'model_list'], note: '對應段落（車款介紹頁由上到下）：\nhero＝封面\nhighlight＝重點特色\nfeature_exterior＝外觀\nfeature_color＝車色\nfeature_interior＝內裝\nfeature_performance＝性能\nfeature_safety＝安全\nfeature_charging＝充電\nlink_plus＝LINK+\nfaq＝FAQ\nspec_equipment＝規格配備\nrecommend＝為您推薦\nmodel_list＝車款列表\n該車款沒有的段落不會送出。' },
    carousel_id:      { any: ['home_hero', 'feature_exterior', 'feature_color', 'feature_interior', 'feature_performance', 'feature_safety', 'feature_charging'], note: '對應位置：\nhome_hero＝首頁_封面輪播\nfeature_exterior＝車款內頁_外觀特色\nfeature_color＝車款內頁_車色特色\nfeature_interior＝車款內頁_內裝特色\nfeature_performance＝車款內頁_性能特色\nfeature_safety＝車款內頁_安全特色\nfeature_charging＝車款內頁_充電特色' },
    banner_title:     { dyn: 'Banner 上的標題文字（不超過 100 字元）' },
    banner_index:     { dyn: 'Banner 在輪播中的順序，從 1 起算', num: true },
    slide_index:      { dyn: '只有 entry_point 為 home_hero（首頁封面輪播）時帶，被點擊的是第幾張，從 1 起算', num: true, opt: true },
    state:            { any: ['on', 'off'] },
  },

  evt: {
    select_model:     { brief: '各入口導流到車款頁的比例', params: ['entry_point', 'model', 'slide_index'], trigger: '點擊', purpose: '了解各入口導流到車款頁的比例。首頁、選單、頁尾共用同一事件，以 entry_point 區分。' },
    spec_switch:      { brief: '舊版選單「售價&規格」開關的使用情況', only: 'mirror', params: ['state'], trigger: '點擊', purpose: '了解舊版車款選單上「售價&規格」切換開關的使用情況；state 記錄點擊後的狀態（on＝顯示售價與規格、off＝隱藏）。' },
    banner_view:      { brief: '輪播中每張 Banner 被看到的次數與順序', params: ['carousel_id', 'banner_title', 'banner_index', 'model'], trigger: '曝光：每張 Banner 出現 0.5 秒就送出；每次頁面瀏覽同一張只送一次', purpose: '了解輪播中每張 Banner 實際被看到的次數與順序。' },
    cta_click:        { brief: '預約試乘、優惠、型錄等按鈕的點擊位置', params: ['cta_type', 'cta_location', 'model'], trigger: '點擊', purpose: '了解預約試乘、優惠、型錄下載等按鈕的點擊位置。型錄若為 PDF 連結，GA4 加強型評估的 file_download 也會記錄，此事件用來補上車款與位置。在沒有指定車款的頁面（如首頁）點 FAB 時，model 可留空。' },
    section_view:     { brief: '各內容段落是否被看到', params: ['section', 'model'], trigger: '曝光：以段落標題為準，畫面由下到上為 0–100，標題往上滑動到 30 的位置時送出；每次頁面瀏覽每段只送一次', purpose: '了解各段落有多少比例的人看到，即瀏覽深度。' },
    variant_select:   { brief: '特色段落左方「車型」下拉選單的使用情況', params: ['section', 'model'], trigger: '點擊：在下拉選單中選了一個車型後送出（只打開選單不選不算）', purpose: '了解車款介紹頁各特色段落左方的車型下拉選單有沒有人使用、在哪個段落使用。section 帶該下拉選單所在的段落，model 帶目前的車款。' },
  }
};
