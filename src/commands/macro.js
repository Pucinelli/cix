module.exports = {
  name: 'macro',
  alias: 'm',
  description: 'Define or redefine a macro command to be run cix\'s environment',
  run: async toolbox => {
    const { print, parameters, configManager } = toolbox

    await configManager.parseArgOptions(parameters.options)
    const verboseLevel = toolbox.projectConfig.verboseLevel

    if (verboseLevel >= 3)
      print.info('Verifying macro name')
    const name = parameters.first
    if (verboseLevel >= 3)
      print.info('Ok')

    if (verboseLevel >= 3)
      print.info('Verifying macro command')
    const command = parameters.array.slice(1)
      .map(it => it.includes(' ') ? `"${it}"` : it)
      .join(' ')
    if (verboseLevel >= 3)
      print.info('Ok')

    if (!name) {
      print.error('Error: No name specified')
      return
    }

    if (!command) {
      print.error('Error: No command specified')
      return
    }

    if (verboseLevel >= 2)
      print.info('Loading pre-existent macros')
    const data = { macros: {} }
    if (verboseLevel >= 2)
      print.info('Updating macro configuration')
    data.macros[name] = command
    if (verboseLevel >= 2)
      print.info('Updating configuration file')
    await configManager.update(data)
    if (verboseLevel >= 1)
      print.info('New macro created')
  }
}
