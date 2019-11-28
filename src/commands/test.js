module.exports = {
  name: 'test',
  alias: 't',
  description: 'Run specified test routines for project',
  run: async toolbox => {
    const { configManager, childProcess } = toolbox
    const { testPolicies } = await configManager.load()

    await childProcess.run(testPolicies.runBefore)
    await childProcess.run(testPolicies.testCommand)
    await childProcess.run(testPolicies.runAfter)
  }
}
