const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    getWorkDir() {
      return ipcRenderer.invoke('getWorkDir')
    },
    showOpenDialog(title) {
      return ipcRenderer.invoke('showOpenDialog', title)
    },
    getModelList(dirPath) {
      return ipcRenderer.invoke('getModelList', dirPath)
    },
    saveModel(modelPath, content) {
      return ipcRenderer.invoke('saveModel', modelPath, content)
    },
    deleteModelFile(modelPath) {
      return ipcRenderer.invoke('deleteModel', modelPath)
    },
    showItemInFolder(modelPath) {
      ipcRenderer.send('showItemInFolder', modelPath)
    }
  }
)
