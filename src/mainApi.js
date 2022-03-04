const { dialog, ipcMain, BrowserWindow, shell } = require('electron')
const path = require('path');
const fsPromise = require('fs').promises;
const fs = require('fs')
import logger from './log'

async function getFiles(dir) {
  const dirents = await fsPromise.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const fullpath = path.resolve(dir, dirent.name);
    
    return dirent.isDirectory() ? getFiles(fullpath) : fullpath;
  }));
  return Array.prototype.concat(...files);
}

ipcMain.handle('showOpenDialog', (event, title) => {
  return dialog.showOpenDialog(BrowserWindow.getAllWindows()[0], {
    title: title,
    properties: ['openDirectory']
  })
})

ipcMain.handle('getModelList', (event, workdir) => {
  return new Promise(async (resolve, reject) => {
    if(!fs.lstatSync(workdir).isDirectory()) {
      resolve({
        success: false,
        message: '获取模型失败，工作目录不正确'
      })
    }else {
      getFiles(workdir).then(modelList => {
        modelList = modelList.filter(
          model => model.endsWith('manifest.json')
          ).map(modelPath => {
          return {
            path: modelPath,
            content: null
          }
        })
        Promise.all(modelList.map(model => {
          return fsPromise.readFile(model.path, {encoding: 'utf8'})
        })).then(fileContents => {
          for(let i = 0; i < modelList.length; i++) {
            let model = modelList[i]
            try {
              model.content = JSON.parse(fileContents[i])
            } catch (error) {
              logger.error(`${model.path} content json parse error:`, error)
              throw new Error(`${model.path} content json parse error:`, error)
            }
          }
          resolve({
            success: true,
            message: '',
            data: modelList,
          })
        }).catch(err => {
          logger.error(`readFile error:`, err)
          throw new Error(`readFile error`)
        })
      }).catch(err => {
        resolve({
          success: false,
          message: '获取模型失败',
        })
      })
    }
  })
})

ipcMain.handle('saveModel', (event, filePath, fileContent) => {
  return new Promise((resolve, reject) => {
    if(fs.lstatSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'manifest.json')
    }
    fsPromise.writeFile(filePath, fileContent, { encoding: 'utf8' }).then(() => {
      resolve({
        success: true,
        data: filePath
      })
    }).catch(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          resolve({
            success: false
          })
          return
        }
      })
      resolve({
        success: false
      })
    })
  })
})

ipcMain.handle('deleteModel', (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        resolve({
          success: false
        })
        return
      }
      resolve({
        success: true
      })
    })
  })
})

ipcMain.on('showItemInFolder', (event, filePath) => {
  shell.showItemInFolder(filePath)
})