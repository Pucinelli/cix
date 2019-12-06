module.exports = {
  name: 'run',
  alias: 'r',
  description: 'Run a shell or a macro command inside cix\'s environment',
  run: async toolbox => {
    const { print, parameters, childProcess, configManager, tunnel } = toolbox

    await configManager.parseArgOptions(parameters.options)
    const verboseLevel = toolbox.projectConfig.verboseLevel
    const port = parameters.options.port || toolbox.projectConfig.port;
    const portForwarding = port && await tunnel.forwardPort({ port });

    if (verboseLevel >= 3)
      print.info('Verifying command')
    if (!parameters.first) {
      print.error('Error: No command specified')
      return
    }

    if (verboseLevel >= 3)
      print.info('Preparing to run command ' + parameters.first)
    await childProcess.run(
      parameters.first,
      parameters.argv.slice(parameters.argv.indexOf(parameters.first) + 1),
      {
        close(_) {
          if (portForwarding)
            portForwarding.close();
        }
      }
    )
  }
}
