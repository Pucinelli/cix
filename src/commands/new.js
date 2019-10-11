module.exports = {
  name: 'new',
  alias: 'n',
  run: async toolbox => {
    const { normalize } = require('path')
    const { print, parameters, filesystem } = toolbox

    if (!parameters.first) {
      print.error('Error: No name specified')
      return
    }

    const path = normalize(parameters.first)
    const name = path.includes(filesystem.separator) 
      ? path.substr(path.indexOf(filesystem.separator))
      : path
    
    if (await filesystem.existsAsync(path)) {
      const dir = await filesystem.dirAsync(path)
      await dir.writeAsync('cix.json', { name, platform: { name: 'mavex' } })
    } else
      print.error(`There is already a file named ${path}`)
  }
}
