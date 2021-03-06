module.exports = {
  name: 'cix',
  hidden: true,
  description: 'Continuous Integration an Remote Execution Tool',
  run: async toolbox => {
    const { print, parameters, configManager } = toolbox

    configManager.parseArgOptions(parameters.options)

    if (parameters.first)
      print.error(`Error: Unknown parameter ${parameters.first}`)
    else
      print.error(`Error: Specify a command`)
    print.info('Usage:')
    print.printHelp(toolbox)
  }
}
