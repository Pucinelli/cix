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
    
    client.childProcesses = {}

    client.on('server:finish', () => client.close())

    client.on('server:fetchProjectData', async data => {
      print.info('Fetching project data')
      for (let file of data.files)
        await operations.createFile(file)
      client.emit('cix:status', { req: 'server:fetchProjectData', status: 0 })
    })
    
    client.on('server:createFile', async data => {
      print.info('Creating files')
      for (let file of data)
        await operations.createFile(file)
      client.emit('cix:status', { req: 'server:createFile', status: 0 })
    })
    
    client.on('server:writeFile', async data => {
      print.info('Writing files')
      for (let file of data)
        await operations.writeFile(file)
      client.emit('cix:status', { req: 'server:writeFile', status: 0 })
    })
    
    client.on('server:removeFile', async data => {
      print.info('Removing files')
      for (let file of data)
        await operations.removeFile(file)
      client.emit('cix:status', { req: 'server:removeFile', status: 0 })
    })

    client.on('server:moveFile', async data => {
      print.info('Moving files')
      for (let { from, to } of data)
        await operations.moveFile({ from, to })
      client.emit('cix:status', { req: 'server:moveFile', status: 0 })
    })

    client.on('server:shellCommand', async data => {
      const { type, command, parameters, pid } = data
      print.info('Running shell command')
      if (type === 'spawn')
        await operations.shellCommand({ client, command, parameters, processes: client.childProcesses })
      else
        client.childProcesses[pid].stdin.write(command)
    })

    client.emit('cix:startup')
  }
}
