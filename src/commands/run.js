module.exports = {
  name: 'run',
  alias: 'r',
  run: async toolbox => {
    const { print, parameters, configManager, childProcess } = toolbox
    const { macros } = await configManager.load()

    const command = Object.keys(macros || {}).includes(parameters.first)
      ? macros[parameters.first]
      : parameters.first

    if (!command) {
      print.error('Error: No command specified')
      return
    }

    const options = parameters.argv.slice(parameters.argv.indexOf(command) + 1).join(' ')

    await childProcess.run(`${command} ${options}`)
  }
}
