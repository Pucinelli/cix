module.exports = toolbox => {

  toolbox.childProcess = {
    run: async (command, options = []) => {
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

      const child = spawn(`${execCommand} ${sanitizedOptions}`, { env, shell: true })

      child.stdout.on('data', data => {
        print.info(data.toString())
      });

      child.stderr.on('data', data => {
        print.error(data.toString())
      });

      child.on('close', code => {
        print.info(`Command \`${command}\` exited with code ${code}`);
      });
    }
  }
}