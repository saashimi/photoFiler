const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  copyFiles: (srcPath, destPath) => ipcRenderer.invoke('dialog:copyFiles', srcPath, destPath)
});