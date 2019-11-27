module.exports = toolbox => {

  toolbox.crdt = {
    writeAsync: async data => {
      const { file, content } = data
      const { filesystem } = toolbox
      const { KSeq } = require('../config/kseq/index')
      
      const previousContent = await filesystem.existsAsync(file)
        ? await filesystem.readAsync(file)
        : ''
      
      const kseq = new KSeq()
      
      for (let i = 0; i < previousContent.length; i++)
        kseq.append(previousContent[i])

      for (let { type, data, pos } of content) {
        // console.log({ type, data, pos })
        if (type === '+')
          kseq.insert(data, pos)
        else
          kseq.remove(pos)
      }

      const contentBuilt = kseq.toArray().join('')
      await filesystem.writeAsync(file, contentBuilt)
      //console.log(contentBuilt)
      
    }
  }

}