module.exports = {
  name: 'test',
  alias: 't',
  description: 'Run specified test routines for project',
  run: async toolbox => {
    const { print, parameters, configManager, childProcess } = toolbox
    const { testPolicies } = await configManager.load()

    await configManager.parseArgOptions(parameters.options)

    const verboseLevel = toolbox.projectConfig.testPolicies.verboseLevel

    if (verboseLevel >= 2)
      print.info('Starting tests pre routines')
    await childProcess.run(testPolicies.runBefore)
    if (verboseLevel >= 2)
      print.info('Starting tests routines')
    await childProcess.run(testPolicies.testCommand)
    if (verboseLevel >= 2)
      print.info('Starting tests post routines')
    await childProcess.run(testPolicies.runAfter)
  }
}
