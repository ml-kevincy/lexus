/* GA4 自訂事件庫（依「Lexus官網_GA4自訂事件埋設規劃」草稿 v0.1）。
   標記放在頁面的哪裡，由人在標示頁上直接畫出來（存在 annotations.json）；這個檔案只放事件本身的內容。
   evt.params：事件帶的參數，順序即程式碼順序。help：參數的可用值（any）與動態值說明（dyn）。 */
window.GA_DATA = {
  measurementId: 'G-4DVH5EF2RM',

  rules: [
    '所有自訂事件都要加 send_to，指定研究用 GA4 資源的評估 ID，避免誤送到媒體代理商的資源。',
    '參數固定值只能使用規格列出的值，新增值需先更新規格。model 一律用車款代號（ES、NX、RX…）。',
    '正式站對應元件加上 data-track 屬性並填入事件名稱，監測期結束後搜尋此屬性即可完整移除。',
    '參數需在 GA4 後台登錄為自訂維度（預估約 15 個）。',
  ],

  pages: {
    home:      { label: '首頁',     url: { mirror: '../mirror/',                     redesign: '../redesign/' } },
    es:        { label: 'ES 車款頁', url: { mirror: '../mirror/showroom/ES.html',     redesign: '../redesign/showroom/ES.html' } },
    testdrive: { label: '預約試乘',   url: { mirror: '../mirror/testdrive.html?id=36', redesign: '../redesign/testdrive.html?id=36' } }
  },

  help: {
    model:            { any: ['ES', 'IS', 'LS', 'RX', 'NX', 'UX', 'LBX', 'LM', 'RZ'], dyn: '依實際車款帶入代號（完整清單待補）', opt: true },
    entry_point:      { any: ['home_hero', 'home_model_block', 'home_other', 'menu', 'footer', 'model_page_bottom'] },
    cta_type:         { any: ['test_drive', 'offer', 'catalog_download', 'smart_plan'], dyn: '依按鈕類型帶入' },
    cta_location:     { any: ['home_hero', 'home_body', 'model_top', 'model_body', 'model_bottom', 'footer'] },
    section:          { any: ['hero', 'highlight', 'feature', 'customize', 'spec', 'equipment', 'compare', 'faq'] },
    section_index:    { dyn: '段落順序，從 1 起算', num: true },
    carousel_id:      { any: ['home_hero', 'highlight', 'feature_exterior', 'feature_interior'] },
    banner_id:        { dyn: '前端為每張 Banner 設定的固定英文代碼，例如 hero_es_launch' },
    banner_title:     { dyn: 'Banner 上的標題文字（不超過 100 字元）' },
    banner_index:     { dyn: 'Banner 在輪播中的順序，從 1 起算', num: true },
    change_by:        { any: ['auto', 'manual', 'initial'], opt: true },
    slide_index:      { dyn: '從輪播點擊時，被點擊的是第幾張，從 1 起算；不是從輪播點擊則不帶', num: true, opt: true },
    total_slides:     { dyn: '輪播總張數', num: true },
    spec_type:        { any: ['spec', 'equipment', 'safety'] },
    switch_type:      { any: ['feature_tab', 'trim_tab'] },
    state:            { any: ['on', 'off'] },
    step:             { any: ['form_start', 'submit_success'] },
    seconds:          { dyn: '段落停留秒數', num: true }
  },

  evt: {
    select_model:     { pri: 1, params: ['entry_point', 'model', 'slide_index'], trigger: '點擊', purpose: '了解各入口導流到車款頁的比例。首頁、選單、頁尾共用同一事件，以 entry_point 區分。' },
    spec_switch:      { pri: 1, only: 'mirror', params: ['state'], trigger: '點擊', purpose: '了解舊版車款選單上「售價&規格」切換開關的使用情況；state 記錄點擊後的狀態（on＝顯示售價與規格、off＝隱藏）。' },
    banner_view:      { pri: 1, params: ['carousel_id', 'banner_id', 'banner_title', 'banner_index', 'total_slides', 'change_by', 'model'], trigger: '曝光：每張 Banner 進入畫面可視範圍時各送一次（停留秒數門檻待定）', purpose: '了解輪播中每一張 Banner 實際被看到的次數與順序。banner_id 用固定代碼統計，banner_title 收畫面上的標題文字，兩者分開，改文案時仍可用代碼串接。change_by 記錄這張是怎麼出現的：initial＝載入時第一張、auto＝自動輪播、manual＝使用者手動切換；車款內頁輪播只能手動，change_by 不需要帶。model 只在車款內頁輪播帶；首頁輪播有多個車款連結，不帶 model。從 Banner 點擊連結由 select_model、cta_click 記錄。' },
    cta_click:        { pri: 1, params: ['cta_type', 'cta_location', 'model', 'slide_index'], trigger: '點擊', purpose: '了解預約試乘、優惠、型錄下載等按鈕的點擊位置。型錄若為 PDF 連結，GA4 加強型評估的 file_download 也會記錄，此事件用來補上車款與位置。首頁、頁尾沒有指定車款時 model 可留空。' },
    section_view:     { pri: 1, params: ['section', 'section_index', 'model'], trigger: '曝光：段落至少一半在畫面內並停留 1 秒以上；每次頁面瀏覽每段只送一次', purpose: '了解各段落有多少比例的人看到，即瀏覽深度。' },
    section_time:     { pri: 2, params: ['section', 'seconds', 'model'], trigger: '曝光：段落離開畫面時送出', purpose: '了解各段落的停留時間（視前端人力決定是否納入）。段落順序與回看行為改由 Hotjar 觀察。' },
    view_spec:        { pri: 2, params: ['spec_type', 'model'], trigger: '互動', purpose: '了解規格表、配備表、安全配備的查看比例。' },
    open_compare:     { pri: 1, params: ['entry_point', 'model'], trigger: '點擊', purpose: '了解比較功能是否被找到、從哪裡進入。對應前測「比較要滑到最底部才找得到」。' },
    feature_switch:   { pri: 3, only: 'mirror', params: ['switch_type', 'section', 'model'], trigger: '互動', purpose: '觀察特色區切換列與車型切換列的使用情況。僅舊版、診斷用，不做前後對照。' },
    safety_jump:      { pri: 3, only: 'mirror', params: ['model'], trigger: '點擊', purpose: '觀察從車款頁跳轉安全配備頁的情況。僅舊版、診斷用；是否返回車款頁以頁面瀏覽的來源頁判斷。' },
    test_drive_step:  { pri: 1, params: ['step', 'model', 'entry_point'], trigger: '表單：form_start＝第一次輸入任一欄位；submit_success＝送出成功後', purpose: '了解已進入表單的人有多少比例完成預約。不得記錄填寫內容。entry_point 由進入預約頁的 CTA 連結帶入，或依來源頁判斷。' }
  }
};
