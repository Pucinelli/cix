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
    
    client.on('server:fetchProjectData', data => {
      print.info(`Server sent: ${JSON.stringify(data, null, 4)}`)
    })
    
    client.on('server:createFile', operations.createFile)
    client.on('server:writeFile', operations.writeFile)
    client.on('server:removeFile', operations.removeFile)
    client.on('server:moveFile', operations.moveFile)
    client.on('server:shellCommand', operations.shellCommand)

    client.emit('cix:startup')
  }
}
