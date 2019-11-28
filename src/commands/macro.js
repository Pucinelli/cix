module.exports = {
  name: 'macro',
  alias: 'm',
  description: 'Define or redefine a macro command to be run cix\'s environment',
  run: async toolbox => {
    const { print, parameters, configManager } = toolbox

    const name = parameters.first
    const command = parameters.array.slice(1)
      .map(it => it.includes(' ') ? `"${it}"` : it)
      .join(' ')
    
    if (!name) {
      print.error('Error: No name specified')
      return
    }

    if (!command) {
      print.error('Error: No command specified')
      return
    }

    const data = { macros: {} }
    data.macros[name] = command
    console.log(data)
    await configManager.update(data)
  }
}
