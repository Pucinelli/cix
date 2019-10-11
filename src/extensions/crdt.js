module.exports = toolbox => {

  toolbox.crdt = {
    build: async data => {
      const { filesystem } = toolbox
      const { join } = require('path')
      const { KSeq } = require('kseq')
      
      for (let file of data) {
        const { filename, extension, path, content } = file
        
        const kseq = new KSeq()
        const fullFileName = join(path, filename + extension)

        for (let { type, data, pos } of content) {
          // console.log({ type, data, pos })
          if (type === '+')
            kseq.insert(data, pos)
          else
            kseq.remove(pos)
        }

        const contentBuilt = kseq.toArray().join('')
        //await filesystem.writeAsync(fullFileName, contentBuilt)
        console.log(contentBuilt)
      }
      
    }
  }

}