module.exports = toolbox => {
  
  toolbox.operations = {
    createFile: async data => {
      const { 
        isDirectory, path, name, ext
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(path, name)
      
      if (isDirectory)
        await filesystem.dirAsync(fullFilePath)
      else
        await filesystem.fileAsync(fullFilePath + ext)
    },
  
    
    writeFile: async data => {
      
    },
  
    
    removeFile: async data => {
      
    },
  
    
    moveFile: async data => {
      
    },
  
    
    shellCommand: async data => {
      
    }
  }
}