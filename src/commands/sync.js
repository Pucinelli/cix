module.exports = {
  name: 'sync',
  alias: 's',
  description: 'Start sync process of cix with the default platform',
  run: async toolbox => {
    const { print, parameters, operations, configManager } = toolbox
    const jwt = require('jwt-simple')
    const { KSeq } = require('../config/kseq/index')

    await configManager.parseArgOptions(parameters.options)
    const verboseLevel = toolbox.projectConfig.verboseLevel

    if (verboseLevel >= 1)
      print.info('Verifying token')
    if (!parameters.first) {
      print.error('Error: Project token not specified')
      return
    }

    try {
      if (verboseLevel >= 3)
        print.info('Trying to decode token')
      const payload = jwt.decode(parameters.first, 'cix-is-awesome')
      if (verboseLevel >= 3)
        print.info('Initialising project')
      await operations.initProject(payload)
    } catch (err) {
      print.error('Error: Could not parse token')
      print.error(err)
      return
    }

    if (verboseLevel >= 2)
      print.info('Verifying project configuration')
    if (!toolbox.projectConfig) {
      print.error('Error: Could not load cix configuration')
      return
    }

    if (verboseLevel >= 2)
      print.info('Starting connection')
    const io = require('socket.io-client');
    const client = io('http://localhost:3000');

    if (verboseLevel >= 3)
      print.info('Setting up exit routine')
    // DONE
    client.on('server:finish', message => message
      ? print.info(message) || client.close()
      : client.close())

    if (verboseLevel >= 3)
      print.info('Setting up initial data routine')
    // DONE
    client.on('server:fetchProjectData', async data => {
      if (verboseLevel >= 1)
        print.info('Fetching project data')

      if (verboseLevel >= 2)
        print.info('Initialising project state')
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

      if (verboseLevel >= 2)
        print.info('Getting file metadata')
      formatFile(data)

      if (verboseLevel >= 3)
        print.info('Creating files')
      for (let file of Object.values(toolbox.projectState)) {
        if (verboseLevel >= 2)
          print.info('Creating file ' + file.path)
        await operations.createFile(file)
      }

      if (verboseLevel >= 1)
        print.info('Emiting completion status')
      client.emit('cix:status', { req: 'server:fetchProjectData', status: 0 })
    })

    if (verboseLevel >= 3)
      print.info('Setting up file creation routine')
    // DONE
    client.on('server:createFile', async data => {
      if (verboseLevel >= 1)
        print.info('Creating files')

      if (verboseLevel >= 2)
        print.info('Creating file ' + data.path)
      await operations.createFile(data)

      if (verboseLevel >= 1)
        print.info('Emiting completion status')
      client.emit('cix:status', { req: 'server:createFile', status: 0 })
    })

    if (verboseLevel >= 3)
      print.info('Setting up file removal routine')
    // DONE
    client.on('server:removeFile', async data => {
      if (verboseLevel >= 1)
        print.info('Removing files')

      if (verboseLevel >= 2)
        print.info('Removing file ' + data)
      await operations.removeFile(data)

      if (verboseLevel >= 2)
        print.info('Emiting completion status')
      client.emit('cix:status', { req: 'server:removeFile', status: 0 })
    })

    if (verboseLevel >= 3)
      print.info('Setting up file writing routine')
    // DONE
    client.on('server:writeFile', async data => {
      const file = toolbox.projectState[data.file]

      if (verboseLevel >= 1)
        print.info('Writing file ' + data.file)

      if (data.type === '+') {
        if (verboseLevel >= 3)
          print.info('Inserting ' + data.change + ' at pos ' + data.pos)
        if (verboseLevel >= 2)
          print.info('Inserting ' + data.change)
        file.content.s.push([`${data.pos}#`, data.change])
        file.crdt.insert(data.change, data.pos - 1)
      } else {
        if (verboseLevel >= 2)
          print.info('Removing at pos ' + data.pos)
        file.content.r.push(data.pos)
        file.crdt.remove(data.pos)
      }

      if (verboseLevel >= 2)
        print.info('Persisting file changes')
      await operations.writeFile(data.file)

      if (verboseLevel >= 1)
        print.info('Emiting completion status')
      client.emit('cix:status', { req: 'server:writeFile', status: 0 })
    })

    if (verboseLevel >= 3)
      print.info('Setting up file reallocation routine')
    // DONE
    client.on('server:moveFile', async data => {
      if (verboseLevel >= 1)
        print.info('Moving file from ' + data.from + ' to ' + data.to)
      await operations.moveFile(data)
      if (verboseLevel >= 1)
        print.info('Emiting completion status')
      client.emit('cix:status', { req: 'server:moveFile', status: 0 })
    })

    if (verboseLevel >= 3)
      print.info('Setting up shell command execution routine')
    // DONE
    client.on('server:shellCommand', async data => {
      const { childProcess } = toolbox

      if (verboseLevel >= 1)
        print.info('Verifying existence of running process')

      if (toolbox.runningProcess) {
        if (toolbox.projectConfig.commandPolicies.logPolicies.input)
          print.info('[STDIN] ' + data)
        toolbox.runningProcess.stdin.write(data + '\n')
      } else {
        if (verboseLevel >= 2)
          print.info('Running shell command')

        childProcess.run(data, [], {
          stdout(output) {
            if (verboseLevel >= 2)
              print.info('Emiting output status')
            client.emit('cix:status', { req: 'server:shellCommand', output: output.toString() })
          },
          stderr(output) {
            if (verboseLevel >= 2)
              print.info('Emiting error status')
            client.emit('cix:status', { req: 'server:shellCommand', output: output.toString() })
          },
          close(statusCode) {
            if (verboseLevel >= 2)
              print.info('Emiting exit status code')
            client.emit('cix:status', { req: 'server:shellCommand', statusCode })
          },
        })
      }
    })

    if (verboseLevel >= 3)
      print.info('Starting up')
    // DONE
    client.emit('cix:startup', parameters.first)
  }
}
