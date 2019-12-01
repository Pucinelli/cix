module.exports = toolbox => {

  const { filesystem, } = toolbox

  const cixConfigDir = `${filesystem.homedir()}${filesystem.separator}.cix`
  const cixConfigFile = `${cixConfigDir}${filesystem.separator}cix.json`
  const defaultConfig = {
    "platform": "mavex",
    "testPolicies": {
      "directory": "tests",
      "testCommand": "echo \"This is the script to run the tests\"",
      "runBefore": "echo \"This is the script to run before the tests\"",
      "runAfter": "echo \"This is the script to run after the tests\"",
      "verboseLevel": 1,
      "logPolicies": {
        "output": true,
        "errors": true,
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
        "output": true,
        "errors": true,
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
      const assign = require('assign-deep')
      await toolbox.configManager.create()
      const config = require(cixConfigFile)
      return assign(config, toolbox.execOptions || {})
    },

    parseArgOptions: async argOptions => {
      const options = {
        testPolicies: {
          logPolicies: {}
        },
        commandPolicies: {
          logPolicies: {},
          environmentVariables: {}
        }
      }

      if ('v' in argOptions) {
        options.verboseLevel = argOptions.v instanceof Array
          ? argOptions.v[argOptions.v.length - 1]
          : argOptions.v
      } else if ('verboseLevel' in argOptions) {
        options.verboseLevel = argOptions.verboseLevel
      }
      if (options.verboseLevel) {
        options.commandPolicies.verboseLevel = options.verboseLevel
        options.testPolicies.verboseLevel = options.verboseLevel
      }

      if ('env' in argOptions) {
        const variables = argOptions.env instanceof Array ? argOptions.env : [argOptions.env]
        for (const env of variables) {
          const [name, ...value] = env.split('=')
          options.commandPolicies.environmentVariables[name] = value instanceof Array
            ? value.join('=')
            : value
        }
      }

      if ('log' in argOptions) {
        const policies = argOptions.log.includes(',')
          ? argOptions.log.split(',')
          : [argOptions.log]

        for (const policy of ['output', 'errors', 'input']) {
          options.commandPolicies.logPolicies[policy] = false
          options.testPolicies.logPolicies[policy] = false
        }

        for (const policy of policies) {
          options.commandPolicies.logPolicies[policy] = true
          options.testPolicies.logPolicies[policy] = true
        }
      }

      toolbox.execOptions = options
      toolbox.projectConfig = await toolbox.configManager.load()
    }
  }

}