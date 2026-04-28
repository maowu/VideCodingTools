1. 準備環境

你需要在電腦上安裝 Node.js。


**使用 Electron 打包**：
* 在 Windows 電腦打包會得到 `.exe`。
* 在 Mac 電腦打包會得到 `.app`。



在 Electron 的專案結構中，win.loadFile('index.html') 這行程式碼會去尋找名為 index.html 的檔案作為進入點。

為了讓你更順利地將其打包成 App，我為你整理了最終的專案目錄結構建議：

專案目錄結構

Plaintext
/my-flipbook-app
├── main.js             (Electron 主程式)
├── index.html          (pdf viewer html)
├── my_book.pdf         (你想展示的 PDF 檔案)
├── package.json        (Node.js 專案設定檔)
└── /node_modules       (安裝電子環境後產生的資料夾)



2. 準備專案目錄

請確保你的資料夾（例如名為 my-flipbook-app）內已經具備以下檔案：

index.html：即你目前在右側視窗看到的程式碼。

my_book.pdf：你想展示的 PDF 檔案（請確保檔名一致）。

main.js：Electron 的入口程式（負責開啟視窗）。

package.json：定義專案資訊與打包指令。

3. 建立必要設定檔

	1. 建立 package.json

	在專案資料夾下建立一個 package.json 檔案，內容如下：

	{
	  "name": "pdf-flipbook",
	  "version": "1.0.0",
	  "main": "main.js",
	  "scripts": {
	    "start": "electron .",
	    "dist": "electron-builder"
	  },
	  "devDependencies": {
	    "electron": "^28.0.0",
	    "electron-builder": "^24.0.0"
	  }
	}


	2. 打包指令

	在終端機 (Terminal / CMD) 執行以下指令：

	# 安裝環境
	npm install

	# 本地預覽測試
	npm start

	# 打包成 Windows 執行檔 (.exe)
	npx electron-builder --win


4. 打包執行的完整步驟

請在你的電腦終端機（Terminal 或 CMD）中依序執行以下步驟：

第一步：安裝環境

進入你的專案資料夾，安裝 Electron 相關套件。


npm install

#### 第二步：本地測試（確認 PDF 是否能顯示）
在打包前，先執行預覽，確保 `index.html` 能夠正確讀取 `my_book.pdf`。

```bash
npm start

#### 第三步：打包成執行檔
針對你想要發佈的平台執行指令：
* **Windows (.exe)**: 執行 `npm run build:win`
* **Mac (.app)**: 執行 `npm run build:mac`

> **注意**：在 `package.json` 中我設定了 `"target": "portable"`。這代表打包出來的 `.exe` 檔是「免安裝版」，最適合放在 USB 中給他人點擊即開。

---

### 4. 存入 USB 給他人觀看

1.  打包完成後，你的專案目錄會多出一個 **`dist`** 資料夾。
2.  進入 `dist` 資料夾，你會看到 `pdf-flipbook-app 1.0.0.exe` (Windows) 或 `.dmg/.app` (Mac)。
3.  將這個執行檔直接複製到 USB 中。
4.  **他人使用方式**：插入 USB，將該檔案複製到電腦桌面（或直接在 USB 內執行），雙擊開啟即可，完全不需要安裝任何瀏覽器插件或環境。

### 常見問題與調整
* **PDF 路徑**：如果在 App 內載入失敗，請確認 `my_book.pdf` 檔案是否確實放在 `index.html` 旁邊。
* **自訂圖示**：如果你想幫 App 換個 icon，可以在 `package.json` 的 `build` 區段加入 `icon` 路徑。

這樣你就完成了一個完全獨立、可離線在 USB 執行的翻頁書 App 了！
