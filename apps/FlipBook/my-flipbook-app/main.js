const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      // 為了安全與相容性，保持預設
      nodeIntegration: false,
      contextIsolation: true
    },
    // 自動隱藏選單列（可選）
    autoHideMenuBar: true 
  });

  // 載入你的翻頁書檔案
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});