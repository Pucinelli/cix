module.exports = {
  name: 'sync',
  alias: 's',
  run: async toolbox => {
    const { print, parameters, filesystem } = toolbox

    if (!parameters.first) {
      print.error('Error: Project token not specified')
      return
    }

    const io = require('socket.io-client');
    const client = io('http://localhost:8080');
  
    client.emit('cix:startup')

    const STATUS = { OK: 0, ERR: 1 }
    const verbose = (msg, mode = 'info') => {
      if (parameters.options.verbose || parameters.options.v)
        print[mode](msg)
    }
    const reply = (client, data) => {
      verbose('Replying status to server')
      client.emit('cix:status', data)
    }
    
    client.on('server:fetchProjectData', data => {
      print.info(`Handling data: ${JSON.stringify(data, null, 4)}`)
      reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:fetchProjectData' })
    })

    
    client.on('server:createFile', data => {
      const { join } = require('path')
      const { path, filename, isDirectory } = data

      verbose(`Creating file '${filename}'`)
      const file = isDirectory
        ? filesystem.dirAsync(join(path, filename))
        : filesystem.fileAsync(join(path, filename + data.extension))
      
      file.then(res => {
        verbose('File created successfully', 'success')
        reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:createFile' })
      }).catch(err => {
        print.error('Error creating file')
        print.info(err)
        reply(client, { projectId: parameters.second, status: STATUS.ERR, req: 'server:createFile' })
      })
    })

    
    client.on('server:removeFile', data => {
      const { join } = require('path')
      const { path, filename, isDirectory } = data

      verbose(`Removing file '${filename}'`)
      const file = isDirectory
        ? filesystem.removeAsync(join(path, filename))
        : filesystem.removeAsync(join(path, filename + data.extension), data.content)
      
      file.then(res => {
        verbose('File removed successfully', 'success')
        reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:removeFile' })
      }).catch(err => {
        print.error('Error creating file')
        print.info(err)
        reply(client, { projectId: parameters.second, status: STATUS.ERR, req: 'server:removeFile' })
      })
    })

    
    client.on('server:moveFile', data => {
      const { from, to } = data
      
      verbose(`Moving file from '${from}' to '${to}'`)
      filesystem.moveAsync(from, to)
        .then(res => {
          verbose('Success moving file', 'success')
          reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:moveFile' })
        }).catch(err => {
          print.error('Error moving file')
          print.info(err)
          reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:moveFile' })
        })
    })


    client.on('server:writeFile', data => {
      const { join } = require('path')
      const { path, filename, extension, content } = data

      verbose(`Writing on file '${filename}'`)
      filesystem.writeAsync(join(path, filename + extension), content)
        .then(res => {
          verbose('Wrote on file successfully', 'success')
          reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:writeFile' })
        }).catch(err => {
          print.error('Error writing on file')
          print.info(err)
          reply(client, { projectId: parameters.second, status: STATUS.OK, req: 'server:writeFile' })
        })
    })


    const shcmd = {}
    client.on('server:shellCommand', data => {
      const { spawn } = require('child_process')
      const { command, params, pid } = data

      if (!!shcmd[pid]) { // commands to a running proccess
        const cmd = shcmd[pid]
        cmd.stdin.write(data.input)
      } else {
        verbose(`Starting '${command}'`)

        const cmd = spawn(command, params)
        shcmd[pid] = cmd

        cmd.stdout.on('data', data => {
          client.emit('cix:shellOutput', { projectId, pid, data })
        })
        
        cmd.stderr.on('data', data => {
          client.emit('cix:shellOutput', { projectId, pid, data })
        })
        
        cmd.on('close', code => {
          reply(client, { projectId: parameters.second, status: code, req: 'server:shellCommand' })
        })
      }
    })
  }
}
