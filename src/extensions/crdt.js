module.exports = toolbox => {

  toolbox.crdt = {
    writeAsync: async filename => {
      const { filesystem, projectState } = toolbox

      const contentBuilt = projectState[filename].crdt.toArray().join('')

      return await filesystem.writeAsync(filename, contentBuilt)
    }
  }

}