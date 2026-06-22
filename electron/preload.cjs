const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  appVersion: process.env.npm_package_version || '1.0.0',

  // Auto-update listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update_available', (_event, info) => callback(info));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download_progress', (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update_downloaded', () => callback());
  },
});
