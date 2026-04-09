# VideCodingTools

這個專案主要用來集中放置我嘗試使用 VideCoding 開發的各種簡易工具。

這裡會收錄不同階段的作品，包含小型實驗、概念驗證、練習性專案，以及未來逐步整理成較完整的實用工具。目標是讓這個 repo 成為一個方便持續累積、分類與回顧的開發工作區。

## 目錄結構

目前專案已調整為以下分層方式：

- `apps/`：放工具原始碼與開發專案
- `pages/`：放 GitHub Pages 可直接發布的靜態頁面
- `index.html`：專案首頁入口，用來整理所有已發布工具

這樣可以同時保留完整 source code，又能把 build 後的頁面獨立整理給 GitHub Pages 使用。

## 專案目的

- 記錄使用 VideCoding 開發工具的實作過程
- 集中管理不同類型的小工具與實驗成果
- 作為新點子、原型與功能驗證的測試場
- 為未來可重用或可擴充的工具建立基礎

## 規劃方向

未來這個專案會持續加入更多工具，依照用途與類型整理，讓內容不會因為數量增加而變得混亂。  
每個工具可以視需要獨立成資料夾，並附上簡單說明、使用方式與開發狀態。

建議每個工具至少包含以下資訊：

- 工具名稱
- 功能簡介
- 所屬分類
- 開發狀態
- 使用方式
- 後續想法或待辦事項

## 工具總表

以下表格可作為未來整理工具的總覽，之後新增工具時可直接補上：

| 工具名稱 | 類型 | 功能說明 | 狀態 | 備註 |
| --- | --- | --- | --- | --- |
| Travel Scrapbook | 互動工具 | 旅遊拼貼頁面，可加入照片、筆記與印章並輸出圖片 | 已建立 | 位於 `pages/TravelScrapbook` |
| AIVideoMaskClipCreator | React/Vite 工具 | 影片遮罩片段產生工具，保留原始碼並可輸出靜態頁面 | 已可發布 | source 在 `apps/`，build 在 `pages/` |
| 待新增 | 待分類 | 尚未建立 | 規劃中 | 預留欄位 |

## 分類建議

未來可依照工具性質整理，例如：

- 檔案處理工具
- 文字與內容整理工具
- 自動化腳本工具
- 資料轉換工具
- 開發輔助工具
- 測試或實驗性工具

如果後續工具數量增加，也可以改成依分類分區整理，例如：

### 檔案處理工具

| 工具名稱 | 功能說明 | 狀態 |
| --- | --- | --- |
| 待新增 | 尚未建立 | 規劃中 |

### 文字與內容整理工具

| 工具名稱 | 功能說明 | 狀態 |
| --- | --- | --- |
| 待新增 | 尚未建立 | 規劃中 |

### 自動化腳本工具

| 工具名稱 | 功能說明 | 狀態 |
| --- | --- | --- |
| 待新增 | 尚未建立 | 規劃中 |

## 使用方式

這個 repo 會隨著工具增加逐步擴充，初期可能以簡單原型與測試性功能為主。  
後續可依每個工具的需求，在對應資料夾內補充更完整的說明文件。

如果要搭配 GitHub Pages 使用，建議採用以下結構：

- 根目錄放置 `index.html` 作為總入口頁
- `apps/` 放開發中的原始碼專案
- `pages/` 放 build 後可直接瀏覽的靜態頁面
- 每個已發布工具在 `pages/` 內使用自己的資料夾與 `index.html`

例如：

- `index.html`
- `apps/AIVideoMaskClipCreator/src`
- `apps/AIVideoMaskClipCreator/package.json`
- `pages/TravelScrapbook/index.html`
- `pages/AnotherTool/index.html`

這樣部署後，每個工具都可以有自己的頁面路徑，方便未來持續增加更多 page。

如果要在首頁工具入口顯示縮圖，建議每個工具資料夾另外放置一張縮圖，例如：

- `pages/TravelScrapbook/thumbnail.png`
- `pages/AnotherTool/thumbnail.png`

之後可以在首頁卡片中引用對應縮圖，讓每個工具入口都有自己的預覽封面。

如果是 Vite 或 React 專案，建議流程如下：

- 在 `apps/ToolName/` 內維護原始碼
- 執行 build 產生靜態頁
- 將 build 結果輸出到 `pages/ToolName/`
- 在根目錄 `index.html` 補上工具入口卡片

以 `AIVideoMaskClipCreator` 為例：

- 原始碼位置：`apps/AIVideoMaskClipCreator`
- 發布位置：`pages/AIVideoMaskClipCreator`
- 建議使用：在工具目錄執行 `npm run build:pages`

## 備註

這是一個持續成長中的工具集合專案，內容會隨著實驗方向、使用需求與開發成果不斷調整。
