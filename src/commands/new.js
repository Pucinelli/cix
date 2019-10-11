module.exports = {
  name: 'new',
  alias: 'n',
  run: async toolbox => {
    const path = require('path')
    const { print, parameters, filesystem } = toolbox

    if (!parameters.first) {
      print.error('Error: No name specified')
      return
    }

    const name = path.resolve(path.normalize(parameters.first))
    
    if (await filesystem.existsAsync(parameters.first))
      filesystem.dir(name)
        .write('cix.json', {
          name,
          platform: {
            name: 'mavex'
          }
        })
    else
      print.error(`There is already a file named ${parameters.first}`)
  }
}
