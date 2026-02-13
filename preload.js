const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

    // 8. Auto Updater
    checkForUpdates: () => ipcRenderer.send('check-for-updates'),
    downloadUpdate: () => ipcRenderer.send('download-update'),
    quitAndInstall: () => ipcRenderer.send('quit-and-install'),

    // Listeners
    onUpdateMessage: (callback) => ipcRenderer.on('update-message', (event, args) => callback(args)),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, args) => callback(args)),
    onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (event, args) => callback(args)),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, args) => callback(args)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, args) => callback(args)),
    onUpdateError: (callback) => ipcRenderer.on('update-error', (event, args) => callback(args))
});