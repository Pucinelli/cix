module.exports = {
  name: 'sync',
  alias: 's',
  description: 'Start sync process of cix with the default platform',
  run: async toolbox => {
    const { print, parameters, operations } = toolbox
    const jwt = require('jwt-simple')
    const { KSeq } = require('../config/kseq/index')

    if (!parameters.first) {
      print.error('Error: Project token not specified')
      return
    }

    try {
      const payload = jwt.decode(parameters.first, 'cix-is-awesome')
      toolbox.projectConfig = await operations.initProject(payload)
    } catch (err) {
      print.error('Error: Could not parse token')
      console.log(err)
      return
    }

    if (!toolbox.projectConfig) {
      print.error('Error: Could not load cix configuration')
      return
    }

    const io = require('socket.io-client');
    const client = io('http://localhost:3000');

    // DONE
    client.on('server:finish', message => message
      ? print.info(message) || client.close()
      : client.close())

    // DONE
    client.on('server:fetchProjectData', async data => {
      print.info('Fetching project data')

      toolbox.projectState = {}

      const formatFile = (fileTree, path = '') => {
        fileTree.forEach(file => {
          file.path = path ? `${path}/${file.name}` : file.name
          if ('children' in file)
            formatFile(file.children, file.path)
          else {
            file.crdt = new KSeq(file.path)
            toolbox.projectState[file.path] = file
          }
        })
      }

      formatFile(data)

      for (let file of Object.values(toolbox.projectState))
        await operations.createFile(file)

      client.emit('cix:status', { req: 'server:fetchProjectData', status: 0 })
    })

    // DONE
    client.on('server:createFile', async data => {
      print.info('Creating files')

      await operations.createFile(data)
      client.emit('cix:status', { req: 'server:createFile', status: 0 })
    })

    // DONE
    client.on('server:removeFile', async data => {
      print.info('Removing files')

      await operations.removeFile(data)
      client.emit('cix:status', { req: 'server:removeFile', status: 0 })
    })

    // DONE
    client.on('server:writeFile', async data => {
      const file = toolbox.projectState[data.file]

      print.info('Writing files')

      if (data.type === '+') {
        file.content.s.push([`${data.pos}#`, data.change])
        file.crdt.insert(data.change, data.pos - 1)
      } else {
        file.content.r.push(data.pos)
        file.crdt.remove(data.pos)
      }

      await operations.writeFile(data.file)
      client.emit('cix:status', { req: 'server:writeFile', status: 0 })
    })

    // DONE
    client.on('server:moveFile', async data => {
      print.info('Moving files')
      await operations.moveFile(data)
      client.emit('cix:status', { req: 'server:moveFile', status: 0 })
    })

    // DONE
    client.on('server:shellCommand', async data => {
      const { childProcess } = toolbox

      if (toolbox.runningProcess) {
        toolbox.runningProcess.stdin.write(data + '\n')
      } else {
        print.info('Running shell command')
        childProcess.run(data, [], {
          stdout(output) {
            client.emit('cix:status', { req: 'server:shellCommand', output: output.toString() })
          },
          stderr(output) {
            client.emit('cix:status', { req: 'server:shellCommand', output: output.toString() })
          },
          close(statusCode) {
            client.emit('cix:status', { req: 'server:shellCommand', statusCode })
          },
        })
      }
    })

    // DONE
    client.emit('cix:startup', parameters.first)
  }
}
