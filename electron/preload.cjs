'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),
  saveImage: (filename, dataBase64) => ipcRenderer.invoke('save-image', filename, dataBase64),
  openLink: (url) => ipcRenderer.invoke('open-link', url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_e, info) => cb(info)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_e, info) => cb(info)),
  installUpdate: () => ipcRenderer.invoke('install-update'),
});
