module.exports = toolbox => {

  const { filesystem, } = toolbox

  const cixConfigDir = `${filesystem.homedir()}${filesystem.separator}.cix`
  const cixConfigFile = `${cixConfigDir}${filesystem.separator}cix.json`
  const defaultConfig = {
    "platform": "mavex",
    "testPolicies": {
      "directory": "tests",
      "testCommand": "echo \"Specify a test command\"",
      "runBefore": "echo \"Starting tests\"",
      "runAfter": "echo \"Finishing tests\"",
      "verboseLevel": 1,
      "logPolicies": {
        "errors": true,
        "debug": true,
        "input": false
      }
    },
    "macros": {
      "build": "echo \"Specify a build routine\""
    },
    "commandPolicies": {
      "useEnvironment": true,
      "environmentVariables": {
        "CIX_PATH": cixConfigDir
      },
      "verboseLevel": 1,
      "logPolicies": {
        "errors": true,
        "debug": true,
        "input": false
      }
    },
    "verboseLevel": 1
  }

  toolbox.configManager = {
    create: async () => {
      if (!await filesystem.existsAsync(cixConfigDir))
        await filesystem.dirAsync(cixConfigDir)
      if (!await filesystem.existsAsync(cixConfigFile))
        await filesystem.writeAsync(cixConfigFile, defaultConfig)
    },

    exists: async () => await filesystem.existsAsync(cixConfigFile),

    update: async data => {
      const assign = require('assign-deep')
      await toolbox.configManager.create()
      const config = require(cixConfigFile)
      const newConfig = assign(config, data)
      await filesystem.writeAsync(cixConfigFile, newConfig)
    },

    load: async () => {
      await toolbox.configManager.create()
      const config = require(cixConfigFile)
      return config
    }
  }

}