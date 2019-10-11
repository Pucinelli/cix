module.exports = {
  name: 'sync',
  alias: 's',
  run: async toolbox => {
    const { print, parameters, operations } = toolbox

    if (!parameters.first) {
      print.error('Error: Project token not specified')
      return
    }

    const io = require('socket.io-client');
    const client = io('http://localhost:8080');
    
    client.on('server:finish', () => client.close())

    client.on('server:fetchProjectData', async data => {
      print.info('Fetching project data')
      for (let file of data.files) {
        const filename = file.path.join('/') + '/' + file.filename + file.extension
        print.info(`Creating file ${filename}`)
        operations.createFile(file)
      }
      client.emit('cix:status', { req: 'server:fetchProjectData', status: 0 })
    })
    
    client.on('server:createFile', async data => {
      print.info('Creating files')
      for (let file of data) {
        const filename = file.path.join('/') + '/' + file.filename + file.extension
        print.info(`Creating file ${filename}`)
        operations.createFile(file)
      }
      client.emit('cix:status', { req: 'server:createFile', status: 0 })
    })
    
    client.on('server:writeFile', async data => {
      print.info('Writing files')
      for (let file of data) {
        const filename = file.path.join('/') + '/' + file.filename + file.extension
        print.info(`Writing file ${filename}`)
        operations.writeFile(file)
      }
      client.emit('cix:status', { req: 'server:writeFile', status: 0 })
    })
    
    client.on('server:removeFile', async data => {
      print.info('Removing files')
      for (let file of data) {
        const filename = file.path.join('/') + '/' + file.filename + file.extension
        print.info(`Removing file ${filename}`)
        operations.removeFile(file)
      }
      client.emit('cix:status', { req: 'server:removeFile', status: 0 })
    })

    client.on('server:moveFile', async data => {
      print.info('Moving files')
      for (let { from, to } of data) {
        const fromFilename = from.path.join('/') + '/' + from.filename + from.extension
        const toFilename = to.path.join('/') + '/' + to.filename + to.extension
        print.info(`Moving file from ${fromFilename} to ${toFilename}`)
        operations.moveFile({ from, to })
      }
      client.emit('cix:status', { req: 'server:moveFile', status: 0 })
    })

    client.on('server:shellCommand', async data => {
      const { type, command, parameters } = data
      print.info('Running shell command')
      if (type === 'spawn') {
        print.info(`Spawning ${command} command with ${parameters} parameters`)
        this.runningCommand = operations.shellCommand({ client, command, parameters })
      } else {
        print.info(`Sending ${parameters} as input to ${command} command`)
        this.runningCommand.stdin.write(command)
      }
    })

    client.emit('cix:startup')
  }
}
