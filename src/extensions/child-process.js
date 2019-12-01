module.exports = toolbox => {

  toolbox.childProcess = {
    run: async (command, options = [], doAfter = {}) => {
      const { print, configManager } = toolbox
      const { spawn } = require('child_process')
      const { macros, commandPolicies } = await configManager.load()

      const execCommand = command in macros ? macros[command] : command
      const sanitizedOptions = options.map(opt => opt.includes(' ') ? `"${opt}"` : opt).join(' ')

      const env = Object.assign(
        commandPolicies.useEnvironment
          ? process.env
          : {},
        commandPolicies.environmentVariables)

      toolbox.runningProcess = spawn(`${execCommand} ${sanitizedOptions}`, { env, shell: true })

      toolbox.runningProcess.stdout.on('data', data => {
        print.info(data.toString())
        if (doAfter.stdout)
          doAfter.stdout(data)
      });

      toolbox.runningProcess.stderr.on('data', data => {
        print.error(data.toString())
        if (doAfter.stderr)
          doAfter.stderr(data)
      });

      toolbox.runningProcess.on('close', code => {
        print.info(`Command \`${command}\` exited with code ${code}`);
        toolbox.runningProcess = undefined
        if (doAfter.close)
          doAfter.close(code)
      });
    }
  }
}