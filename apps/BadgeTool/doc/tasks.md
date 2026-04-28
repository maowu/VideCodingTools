# BadgeTool — 工作清單

## Phase 1：專案初始化

- [x] 1.1 手動建立 Vite + React + TypeScript 專案（目錄非空無法用 scaffold）
- [x] 1.2 安裝依賴：`three @react-three/fiber @react-three/drei react-router-dom lucide-react jszip imagetracerjs`
- [x] 1.3 安裝開發依賴：`@types/three @types/node`
- [x] 1.4 設定 `vite.config.ts`（alias `@/` → `src/`、optimizeDeps for three.js）
- [x] 1.5 設定 `tsconfig.app.json` / `tsconfig.node.json`（strict, path alias）
- [x] 1.6 建立目錄骨架（pages / components / lib / styles / types）
- [x] 1.7 複製 `public/material-previews/` 和 `public/showcase/` 資源
- [x] 1.8 建立 `src/vite-env.d.ts`（CSS import 型別支援）

---

## Phase 2：樣式系統

- [x] 2.1 建立 `src/styles/globals.css`（CSS 變數、reset、基礎排版）
- [x] 2.2 共用元件樣式：RangeControl、NumericField、MaterialSelect、ColorField、CompactSwitch

---

## Phase 3：lib 層（核心邏輯）

- [x] 3.1 `types.ts`
- [x] 3.2 `defaults.ts`
- [x] 3.3 `idle.ts`
- [x] 3.4 `svgSummary.ts`
- [x] 3.5 `materials.ts`
- [x] 3.6 `shapeSettings.ts`
- [x] 3.7 `workDocument.ts`
- [x] 3.8 `workStorage.ts`（DB name: `badge-tool-workspace`）
- [x] 3.9 `modelBuilder.ts`
- [x] 3.10 `snapshot.ts`
- [x] 3.11 `exportModel.ts`
- [x] 3.12 `codeSnippet.ts`
- [x] 3.13 `previewPose.ts`
- [x] 3.14 `pngToSvg.ts`（PNG → SVG 向量化，ImageTracer.js）
- [x] 3.15 `src/types/imagetracerjs.d.ts`（型別宣告）

---

## Phase 4：路由設定

- [x] 4.1 `src/main.tsx` — ReactDOM.createRoot + BrowserRouter
- [x] 4.2 `src/App.tsx` — Routes（`/` → WorkspaceHome, `/work/:id` → MedalWorkbench）

---

## Phase 5：WorkspaceHome 頁面

- [x] 5.1 作品清單讀取（listWorks from IndexedDB）
- [x] 5.2 螺旋卡片佈局算法（getSpiralCell）
- [x] 5.3 平移 / 縮放工作區（pointer drag + wheel zoom）
- [x] 5.4 快照懶加載（waitForIdle → generateWorkSnapshot）
- [x] 5.5 Live Preview 模式（載入 WorkDocument → HomeLivePreviewLayer）
- [x] 5.6 新建作品（navigate `/work/:id`）
- [x] 5.7 匯入 JSON
- [x] 5.8 匯入 Showcase（fetch `/showcase/badge-tool-works.zip`）
- [x] 5.9 匯出全部 ZIP（+ manifest.json）
- [x] 5.10 作品選單：重新命名、刪除、下載 JSON、匯出 GLB

---

## Phase 6：MedalWorkbench 頁面

- [x] 6.1 載入/初始化 WorkDocument（useParams id）
- [x] 6.2 Topbar：返回首頁、標題編輯、儲存狀態指示
- [x] 6.3 三欄佈局（layers-sidebar / viewport-panel / settings-panel）
- [x] 6.4 SVG 拖放 / 上傳
- [x] 6.5 **PNG 上傳 → 自動向量化為 SVG**（轉換中顯示 spinner）
- [x] 6.6 圖層側欄：清單渲染、單選 / 多選（Cmd+Click, Shift+Click, Cmd+A, Esc, Delete）
- [x] 6.7 設定側欄：厚度、倒角、材質、顏色、高度偏移、可見性、windingMode
- [x] 6.8 SVG 屬性面板（circle radius / rect width & height & corner radius）
- [x] 6.9 Dome 設定面板
- [x] 6.10 畫布設定列（背景色、格線、陰影開關）
- [x] 6.11 自動儲存（2s debounce → requestIdleCallback）
- [x] 6.12 未儲存變更偵測（payload signature 比對）

---

## Phase 7：3D 元件

- [x] 7.1 `ModelPreview.tsx` — react-three-fiber Canvas 封裝
- [x] 7.2 燈光（AmbientLight + 2× DirectionalLight）
- [x] 7.3 OrbitControls + damping
- [x] 7.4 ContactShadows + FloorGrid（可選）
- [x] 7.5 Environment preset="city"
- [x] 7.6 `useMemo` 保護 buildMedalGroup
- [x] 7.7 disposeObject3D on unmount
- [x] 7.8 CanvasResizer（ResizeObserver）
- [x] 7.9 `HomeLivePreviewLayer.tsx` — 首頁多視窗 WebGL（scissor + zoom 動畫）

---

## Phase 8：匯出功能

- [x] 8.1 單一 JSON 下載
- [x] 8.2 全部 ZIP 下載（JSZip + manifest.json）
- [x] 8.3 GLB 3D 匯出（GLTFExporter）
- [ ] 8.4 程式碼片段複製 UI（codeSnippet.ts 已完成，編輯器入口尚未加入）

---

## Phase 9：文件

- [x] 9.1 `specs.md` — 技術規格書
- [x] 9.2 `tasks.md` — 工作清單
- [x] 9.3 `README.md` — 專案說明

---

## Phase 10：品質驗收

- [ ] 10.1 `npm run dev` 瀏覽器實際測試（首頁 + 編輯器完整流程）
- [ ] 10.2 TypeScript strict 零錯誤 ✅（`npm run build` 通過）
- [ ] 10.3 PNG 向量化功能測試（各類 PNG 輸入）
- [ ] 10.4 快照生成、IndexedDB CRUD 測試
- [ ] 10.5 匯入/匯出往返測試（JSON → ZIP → 重新匯入）
- [ ] 10.6 Bundle size 優化（Three.js code-split，目前 1.43MB）
- [ ] 10.7 瀏覽器相容性（Chrome / Firefox / Safari）

---

## 里程碑

| 里程碑 | 包含 Phase | 狀態 |
|--------|-----------|------|
| M1 基礎架構 | 1–2 | ✅ 完成 |
| M2 核心引擎 | 3–4 | ✅ 完成 |
| M3 首頁完成 | 5 | ✅ 完成 |
| M4 編輯器完成 | 6–7 | ✅ 完成 |
| M5 匯出完成 | 8 | 🔲 程式碼片段 UI 待接入 |
| M6 文件完成 | 9 | ✅ 完成 |
| M7 上線品質 | 10 | 🔲 待瀏覽器測試 |
