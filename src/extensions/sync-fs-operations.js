module.exports = toolbox => {
  
  toolbox.operations = {
    createFile: async data => {
      const { 
        filename, path, extension, isDirectory
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(...path, filename)
      
      if (isDirectory)
        await filesystem.dirAsync(fullFilePath)
      else
        await filesystem.fileAsync(fullFilePath + extension)
    },
  
    
    writeFile: async data => {
      const { 
        content, path, filename, extension
      } = data
      const { crdt } = toolbox
      const { join } = require('path')
      const fullFilePath = join(...path, filename)
      
      await crdt.writeAsync({ file: fullFilePath + extension, content })
    },
  
    
    removeFile: async data => {
      const { 
        path, filename, extension
      } = data
      const { filesystem } = toolbox
      const { join } = require('path')
      const fullFilePath = join(...path, filename)
      
      await filesystem.removeAsync(fullFilePath + extension)
    },
  
    
    moveFile: async data => {
      const { join } = require('path')
      const { from, to } = data
      const { filesystem } = toolbox
      
      const fromFile = join(...from.path, from.filename + from.extension)
      const toFile = join(...to.path, to.filename + to.extension)
      
      await filesystem.moveAsync(fromFile, toFile)
    },
  
    // probably gonna move this to other file
    shellCommand: async data => {
      const { spawn } = require('child_process')
      const { client, command, parameters } = data

      if (false) {
        // const process = getProcessSomehow()
        // process.stdin.write(data.input)
      } else {
        const process = spawn(command, parameters)
        const { pid } = process
      
        process.stdout.on('data', data => {
          const isStillAlive = process.connected || !process.killed
          client.emit('cix:shellOutput', { output: data.toString(), isStillAlive, pid })
        })
        
        process.stderr.on('data', data => {
          const isStillAlive = process.connected || !process.killed
          client.emit('cix:shellOutput', { output: data.toString(), isStillAlive, pid })
        })
        
        process.on('close', code => {
          client.emit('cix:status', { req: 'server:shellCommand', status: code, pid })
        })

        client.childProcesses[pid] = process
      }
    }
  }
}