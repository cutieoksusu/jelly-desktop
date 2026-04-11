const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
    openWalk: () => ipcRenderer.send('open-walk'),
    walkDone: (stats) => ipcRenderer.send('walk-done', stats),
    onWalkResult: (callback) => ipcRenderer.on('walk-result', (_event, value) => callback(value)),
    quitApp: () => ipcRenderer.send('quit-app')
});