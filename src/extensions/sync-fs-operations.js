module.exports = toolbox => {

  const initCrdt = async data => {
    if (data.children)
      for (const child of data.children)
        initCrdt(child)
    else if (data.content)
      for (const op of data.content.s)
        data.crdt.append(op[1])
  }

  toolbox.operations = {
    initProject: async data => {
      const { print, filesystem, configManager } = toolbox
      const { existsAsync, cwd, resolve } = filesystem
      const deepAssign = require('assign-deep')

      const verboseLevel = toolbox.projectConfig.verboseLevel

      if (verboseLevel >= 3)
        print.info('Getting current cix configuration path')
      const currentCixJson = resolve(cwd(), 'cix.json')

      if (verboseLevel >= 2)
        print.info('Verifying cix configuration existence')
      if (await existsAsync(currentCixJson)) {
        if (verboseLevel >= 2)
          print.info('Loading cix configuration')
        toolbox.projectConfig = deepAssign(await configManager.load(), require(currentCixJson))
      } else if (!await existsAsync(resolve(cwd(), data.projectName))) {
        if (verboseLevel >= 2)
          print.info('Creating project directory')
        await filesystem.dirAsync(data.projectName)
        if (verboseLevel >= 3)
          print.info('Changing current working directory to project root directory')
        process.chdir(data.projectName)
        if (verboseLevel >= 2)
          print.info('Creating project\'s cix configuration file')
        await filesystem.writeAsync('cix.json', data)
        if (verboseLevel >= 3)
          print.info('Reloading configuration')
        toolbox.projectConfig = deepAssign(await configManager.load(), data)
      } else {
        print.error(`There is already a directory named '${data.projectName}' here`)
      }
    },

    createFile: async data => {
      const { filesystem, crdt, projectState } = toolbox
      const { KSeq } = require('../config/kseq/index')

      const verboseLevel = toolbox.projectConfig.verboseLevel

      if (verboseLevel >= 3)
        print.info('Creating CRDT object')
      data.crdt = new KSeq(data.path)
      projectState[data.path] = data

      if (verboseLevel >= 3)
        print.info('Initialising CRDT')
      const filename = data.path.replace(/\//g, filesystem.separator)
      initCrdt(data)

      if (verboseLevel >= 3)
        print.info('Verifying file type')
      if (!!data.children) {
        if (verboseLevel >= 3)
          print.info('Creating directory ' + filename)
        await filesystem.dirAsync(filename)
      } else {
        if (verboseLevel >= 3)
          print.info('Creating file ' + filename)
        await filesystem.fileAsync(filename)
        if (verboseLevel >= 2)
          print.info('Writing file ' + filename)
        await crdt.writeAsync(filename)
      }
    },


    writeFile: async data => {
      const { crdt } = toolbox
      if (toolbox.projectConfig.verboseLevel >= 2)
        print.info('Writing file ' + data)
      return await crdt.writeAsync(data)
    },


    removeFile: async data => {
      const { filesystem, projectState } = toolbox
      const filename = data.replace(/\//g, filesystem.separator)

      if (toolbox.projectConfig.verboseLevel >= 2)
        print.info('Deleting file ' + filename)

      delete projectState[filename]

      return await filesystem.removeAsync(filename)
    },


    moveFile: async data => {
      const { filesystem, projectState } = toolbox
      const { from, to } = data

      if (toolbox.projectConfig.verboseLevel >= 3)
        print.info('Handling platform specific file separator')

      const fromFile = from.replace(/\//g, filesystem.separator)
      const toFile = to.replace(/\//g, filesystem.separator)

      if (toolbox.projectConfig.verboseLevel >= 3)
        print.info('Editing file\' metadata')
      projectState[fromFile].path = toFile
      projectState[toFile] = projectState[fromFile]
      delete projectState[fromFile]

      if (toolbox.projectConfig.verboseLevel >= 2)
        print.info('Moving file from ' + from + ' to ' + to)
      return await filesystem.moveAsync(fromFile, toFile)
    }
  }
}