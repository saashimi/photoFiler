const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  copyFiles: (srcPath, destPath) => ipcRenderer.send('dialog:copyFiles', srcPath, destPath)
})