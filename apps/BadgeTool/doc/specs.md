# BadgeTool — 規格書

> 基於 medal-forge-main 功能，架構改用 **Vite + React** (純 SPA，無 SSR)

---

## 1. 技術棧

| 項目 | 選擇 |
|------|------|
| 建構工具 | Vite 6.x |
| UI 框架 | React 19 + TypeScript |
| 路由 | React Router v7 |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 圖示 | Lucide React |
| ZIP 處理 | JSZip |
| 樣式 | CSS 變數（全域單一 CSS） |
| 持久化 | IndexedDB（純客戶端） |
| PNG 向量化 | ImageTracer.js |

---

## 2. 應用路由

```
/                → WorkspaceHome（作品清單）
/work/:id        → MedalWorkbench（編輯器）
```

> 無 API Route；showcase ZIP 放在 `public/showcase/` 直接 `fetch` 取得。

---

## 3. 目錄結構

```
src/
├── main.tsx                      # Entry point
├── App.tsx                       # Router root
├── vite-env.d.ts                 # Vite client types
├── pages/
│   ├── WorkspaceHome.tsx         # 首頁 / 作品畫廊
│   └── MedalWorkbench.tsx        # 編輯器主頁面
├── components/
│   ├── ModelPreview.tsx          # Three.js 3D 預覽（react-three-fiber）
│   └── HomeLivePreviewLayer.tsx  # 首頁多視窗 WebGL 預覽層
├── lib/
│   ├── types.ts                  # 所有 TypeScript 介面
│   ├── defaults.ts               # 預設值常數
│   ├── idle.ts                   # requestIdleCallback 封裝
│   ├── svgSummary.ts             # SVG 路徑解析
│   ├── shapeSettings.ts          # 形狀設定工具
│   ├── materials.ts              # 6 種 PBR 材質預設
│   ├── workDocument.ts           # 文件結構 & 驗證
│   ├── workStorage.ts            # IndexedDB CRUD
│   ├── modelBuilder.ts           # SVG → THREE.Group 轉換引擎
│   ├── snapshot.ts               # 離屏快照生成（320×320）
│   ├── exportModel.ts            # GLTFExporter GLB 匯出
│   ├── codeSnippet.ts            # React/Three.js 程式碼片段
│   ├── previewPose.ts            # 相機位置常數
│   ├── pngToSvg.ts               # PNG → SVG 向量化（ImageTracer.js）
│   └── idle.ts
├── styles/
│   └── globals.css
├── types/
│   └── imagetracerjs.d.ts        # ImageTracer 型別宣告
public/
├── material-previews/            # 材質預覽 SVG（6 種）
└── showcase/
    └── badge-tool-works.zip
```

---

## 4. 核心功能規格

### 4.1 WorkspaceHome（作品清單頁）

- 螺旋式卡片佈局，支援平移 / 縮放（pointer drag + wheel zoom）
- 每張卡片顯示縮圖（PNG 快照，背景懶加載）
- Live Preview 模式：開啟後載入完整 3D 預覽，可拖拽旋轉，點擊放大
- 作品選單：重新命名、刪除、下載 JSON、匯出 GLB
- 全域操作：新建、匯入 JSON(s)、匯入 Showcase ZIP、匯出全部 ZIP

### 4.2 MedalWorkbench（編輯器）

**佈局（三欄）：**
```
[Topbar: Home | 標題 | 存檔狀態]
[圖層側欄 280px] [3D 預覽 flex] [設定側欄 280px]
[畫布設定列]
```

**編輯流程：**
1. 拖放 / 點選上傳 `.svg` 或 `.png`
   - PNG 自動透過 ImageTracer.js 向量化為 SVG
2. 解析所有路徑為圖層清單
3. 單選 / 多選圖層（Cmd+Click, Shift+Click, Cmd+A, Esc, Delete）
4. 調整每圖層參數（厚度、倒角、材質、顏色、高度偏移、可見性、windingMode）
5. SVG 屬性面板（circle radius / rect width & height & corner radius）
6. 即時 3D 更新

**自動儲存：** 變更後 2s idle → requestIdleCallback → 儲存至 IndexedDB

### 4.3 PNG → SVG 向量化

| 參數 | 預設值 | 說明 |
|------|--------|------|
| 最大尺寸 | 512px | 超過自動縮小 |
| 色彩數 | 16 | numberofcolors |
| 模糊半徑 | 1 | 降低 noise |
| 路徑過濾 | 8px | 丟棄細碎路徑 |

### 4.4 3D 預覽（ModelPreview）

- react-three-fiber Canvas
- OrbitControls（互動旋轉，damping）
- ContactShadows + Floor Grid（可選）
- 燈光：AmbientLight × 1 + DirectionalLight × 2
- Environment preset="city"
- `useMemo` 保護 buildMedalGroup 重建
- disposeObject3D on unmount / group 更新

### 4.5 HomeLivePreviewLayer（首頁 3D 層）

- 單一 WebGL renderer，scissor rendering 同時渲染多張卡片
- Intro 動畫（1.25s easeOutCubic spin-in）
- Zoom 動畫（opening / closing，760ms）
- 背景半透明遮罩（orthographic dim overlay）
- 拖拽旋轉（pointer drag）

### 4.6 資料模型（WorkDocument）

```typescript
interface WorkDocumentV1 {
  kind: "com.medal-forge.work"     // 相容 showcase ZIP 格式
  schemaVersion: 1
  app: { name: "Medal Forge"; version: string }
  document: { id: string; title: string; createdAt: string; updatedAt: string }
  source: { primaryAssetId: string; assets: WorkSvgAsset[] }
  scene: { unit: "scene-unit"; settings: MedalSettings }
  preview: { snapshot: WorkSnapshot | null }
  editorState: { selectedPathIndexes: number[] }
}
```

> `kind` 保留 `"com.medal-forge.work"` 以維持與 showcase ZIP 的相容性。

### 4.7 匯出功能

| 功能 | 格式 | 說明 |
|------|------|------|
| 單一作品備份 | JSON | 含快照 data URL |
| 全部作品備份 | ZIP（多 JSON + manifest） | 含更新快照 |
| 3D 模型 | GLB（binary） | GLTFExporter |
| 程式碼片段 | React/TSX | 含 buildMedalGroup 呼叫 |
| Showcase 匯入 | ZIP → JSON | fetch `/showcase/badge-tool-works.zip` |

### 4.8 材質系統

6 種 PBR 預設：

| ID | 名稱 |
|----|------|
| `brushedGold` | Brushed Gold |
| `agedSilver` | Aged Silver |
| `blackenedSteel` | Blackened Steel |
| `copper` | Copper |
| `whiteCeramic` | White Ceramic |
| `mattePolymer` | Matte Polymer |

### 4.9 快照生成

- 離屏 WebGL Canvas（320×320）
- 自動計算 BoundingSphere，動態定位相機
- sRGB + ACESFilmic ToneMapping
- RoomEnvironment PMREM
- 簽名機制（內容 hash），僅在資料變更時重建

---

## 5. CSS 設計系統

CSS 變數體系：

```css
--bg / --panel / --panel-soft / --line / --line-strong
--text / --muted
--accent / --accent-strong
--good / --warn / --danger
--shadow
```

元件：RangeControl、NumericField（drag to scrub）、MaterialSelect、ColorField、CompactSwitch

---

## 6. Next.js → Vite 差異對照

| Next.js 原始 | Vite+React 替代 |
|---|---|
| `app/page.tsx` | `src/pages/WorkspaceHome.tsx` |
| `app/work/[id]/page.tsx` | `src/pages/MedalWorkbench.tsx` + React Router `:id` |
| `app/api/showcase/route.ts` | 直接 `fetch('/showcase/badge-tool-works.zip')` |
| `next/navigation` useRouter | `react-router-dom` useNavigate / useParams |
| `"use client"` 指令 | 全部移除（Vite SPA 預設為客戶端） |
| `next.config.ts` | `vite.config.ts` |

---

## 7. 效能目標

- 首頁載入：< 3s
- 3D 更新響應：< 100ms
- 快照生成：requestIdleCallback，不阻塞 UI
- PNG 向量化：< 3s（512px 以內）
