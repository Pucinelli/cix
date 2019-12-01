module.exports = toolbox => {

  toolbox.crdt = {
    writeAsync: async filename => {
      const { filesystem, projectState } = toolbox

      if (toolbox.projectConfig.verboseLevel >= 3)
        print.info('Resolving CRDT for ' + filename)
      const contentBuilt = projectState[filename].crdt.toArray().join('')

      if (toolbox.projectConfig.verboseLevel >= 2)
        print.info('Writing file ' + filename)
      return await filesystem.writeAsync(filename, contentBuilt)
    }
  }

}