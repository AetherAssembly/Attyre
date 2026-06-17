'use strict';
const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true } },
]);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 400,
    minHeight: 600,
    center: true,
    title: 'Attyre',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    loadWithRetry(win);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

async function loadWithRetry(w, retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      await w.loadURL('http://localhost:1420');
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  w.loadURL('http://localhost:1420');
}

function safeImagePath(filename) {
  if (!filename || filename.includes('..') || /[/\\]/.test(filename)) return null;
  const imagesDir = path.join(app.getPath('userData'), 'images');
  const resolved = path.join(imagesDir, filename);
  return resolved.startsWith(imagesDir + path.sep) ? resolved : null;
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const filename = new URL(request.url).pathname.replace(/^\//, '');
    const imagePath = safeImagePath(filename);
    if (!imagePath) return callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
    callback({ path: imagePath });
  });

  createWindow();

  if (process.platform !== 'darwin') {
    try {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.on('update-available', info => win?.webContents.send('update-available', info));
      autoUpdater.on('update-downloaded', info => win?.webContents.send('update-downloaded', info));

      ipcMain.handle('check-for-updates', async () => {
        const result = await autoUpdater.checkForUpdates();
        if (!result) return null;
        const latest = result.updateInfo.version;
        return latest !== app.getVersion() ? latest : null;
      });

      ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());
    } catch (err) {
      console.error('[updater] failed to initialize:', err.message);
    }
  }
});

ipcMain.handle('get-app-data-path', () => app.getPath('userData'));

ipcMain.handle('save-image', (_event, filename, dataBase64) => {
  const imagesDir = path.join(app.getPath('userData'), 'images');
  fs.mkdirSync(imagesDir, { recursive: true });
  const imagePath = safeImagePath(filename);
  if (!imagePath) throw new Error('Invalid image filename');
  fs.writeFileSync(imagePath, Buffer.from(dataBase64, 'base64'));
});

app.on('window-all-closed', () => app.quit());
