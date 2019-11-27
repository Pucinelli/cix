module.exports = {
  name: 'run',
  alias: 'r',
  run: async toolbox => {
    const { print, parameters, configManager, childProcess } = toolbox
    const { macros } = await configManager.load()

    const exec = Object.keys(macros).includes(parameters.first)
      ? {
        command: macros[parameters.first],
        options: parameters.argv.slice(parameters.argv.indexOf(parameters.first) + 1).join(' ')
      }
      : {
        command: parameters.first,
        options: parameters.argv.slice(parameters.argv.indexOf(parameters.first) + 1).join(' ')
      }

    if (!exec.command) {
      print.error('Error: No command specified')
      return
    }

    await childProcess.run(`${exec.command} ${exec.options}`)
  }
}
