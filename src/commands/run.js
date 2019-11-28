module.exports = {
  name: 'run',
  alias: 'r',
  description: 'Run a shell or a macro command inside cix\'s environment',
  run: async toolbox => {
    const { print, parameters, childProcess } = toolbox

    if (!parameters.first) {
      print.error('Error: No command specified')
      return
    }

    await childProcess.run(
      parameters.first,
      parameters.argv.slice(parameters.argv.indexOf(parameters.first) + 1)
    )
  }
}
