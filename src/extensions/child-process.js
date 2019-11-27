module.exports = toolbox => {

  const { print } = toolbox

  toolbox.childProcess = {
    run: async (command) => {
      const { exec } = require('child_process')

      const config = await toolbox.configManager.load()
      const env = Object.assign(
        config.commandPolicies.useEnvironment
          ? process.env
          : {},
        config.commandPolicies.environmentVariables)

      exec(command, { env, shell: true }, (error, stdout, stderr) => {
        const output = {
          error: error,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        }
        if (output.error) {
          print.error(output.error)
          return
        }
        if (output.stdout)
          print.info(output.stdout)
        if (output.stderr)
          print.info(output.stderr)
      })
    }
  }

}