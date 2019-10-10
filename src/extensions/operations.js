module.exports = toolbox => {
  
  // probably gonna rename this to something fs-related
  toolbox.operations = {
    createFile: async data => {
      const { 
        isDirectory, path, filename, extension = ''
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(path, filename)
      
      if (isDirectory)
        await filesystem.dirAsync(fullFilePath)
      else
        await filesystem.fileAsync(fullFilePath + extension)
    },
  
    
    writeFile: async data => {
      const { 
        content, path, filename, extension = ''
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(path, filename)
      
      await filesystem.writeAsync(fullFilePath + extension, content)
    },
  
    
    removeFile: async data => {
      const { 
        path, filename, extension = ''
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(path, filename)
      
      await filesystem.removeAsync(fullFilePath + extension)
    },
  
    
    moveFile: async data => {
      const { from, to } = data
      const { filesystem } = toolbox
      
      await filesystem.moveAsync(from, to)
    },
  
    // probably gonna move this to other file
    shellCommand: async data => {
      const { spawn } = require('child_process')
      const { command, parameters } = data

      if (processStillRunning) {
        const process = getProcessSomehow()
        process.stdin.write(data.input)

      } else {
        const process = spawn(command, parameters)
      
        process.stdout.on('data', data => {
          
        })
        
        process.stderr.on('data', data => {
          
        })
        
        process.on('close', code => {
          
        })
      }
    }
  }
}