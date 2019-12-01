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

      const currentCixJson = resolve(cwd(), 'cix.json')

      if (await existsAsync(currentCixJson)) {
        return deepAssign(await configManager.load(), require(currentCixJson))
      } else if (!await existsAsync(resolve(cwd(), data.projectName))) {
        await filesystem.dirAsync(data.projectName)
        process.chdir(data.projectName)
        await filesystem.writeAsync('cix.json', data)
        return deepAssign(await configManager.load(), data)
      } else {
        print.error(`There is already a directory named '${data.projectName}' here`)
      }
    },

    createFile: async data => {
      const { filesystem, crdt, projectState } = toolbox
      const { KSeq } = require('../config/kseq/index')

      data.crdt = new KSeq(data.path)
      projectState[data.path] = data

      const filename = data.path.replace(/\//g, filesystem.separator)
      initCrdt(data)

      if (!!data.children) {
        await filesystem.dirAsync(filename)
      } else {
        await filesystem.fileAsync(filename)
        await crdt.writeAsync(filename)
      }
    },


    writeFile: async data => {
      const { crdt } = toolbox
      return await crdt.writeAsync(data)
    },


    removeFile: async data => {
      const { filesystem, projectState } = toolbox
      const filename = data.replace(/\//g, filesystem.separator)

      delete projectState[filename]

      return await filesystem.removeAsync(filename)
    },


    moveFile: async data => {
      const { filesystem, projectState } = toolbox
      const { from, to } = data

      const fromFile = from.replace(/\//g, filesystem.separator)
      const toFile = to.replace(/\//g, filesystem.separator)

      projectState[fromFile].path = toFile
      projectState[toFile] = projectState[fromFile]
      delete projectState[fromFile]

      return await filesystem.moveAsync(fromFile, toFile)
    }
  }
}