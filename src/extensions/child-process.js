module.exports = toolbox => {

  toolbox.childProcess = {
    run: async (command, options = [], doAfter = {}) => {
      const { print, configManager } = toolbox
      const { spawn } = require('child_process')
      const { macros, commandPolicies } = await configManager.load()

      const verboseLevel = toolbox.projectConfig.commandPolicies.verboseLevel

      if (verboseLevel >= 3)
        print.info('Verifying existence of macro for command')
      const execCommand = command in macros ? macros[command] : command
      if (verboseLevel >= 3)
        print.info('Formatting command options')
      const sanitizedOptions = options.map(opt => opt.includes(' ') ? `"${opt}"` : opt).join(' ')

      if (verboseLevel >= 2)
        print.info('Preparing environment variables')
      const env = Object.assign(
        commandPolicies.useEnvironment
          ? process.env
          : {},
        commandPolicies.environmentVariables)

      if (verboseLevel >= 2)
        print.info('Spawning command')
      toolbox.runningProcess = spawn(`${execCommand} ${sanitizedOptions}`, { env, shell: true })

      if (verboseLevel >= 2)
        print.info('Setting up routines to handle stdout')
      toolbox.runningProcess.stdout.on('data', data => {
        if (toolbox.projectConfig.commandPolicies.logPolicies.output)
          print.info(data.toString())
        if (doAfter.stdout)
          doAfter.stdout(data)
      });

      if (verboseLevel >= 2)
        print.info('Setting up routines to handle stderr')
      toolbox.runningProcess.stderr.on('data', data => {
        if (toolbox.projectConfig.commandPolicies.logPolicies.errors)
          print.error(data.toString())
        if (doAfter.stderr)
          doAfter.stderr(data)
      });

      if (verboseLevel >= 2)
        print.info('Setting up routines to handle process exit')
      toolbox.runningProcess.on('close', code => {
        if (verboseLevel >= 1)
          print.info(`Command \`${command}\` exited with code ${code}`);
        if (verboseLevel >= 2)
          print.info(`Clearing up process`);
        delete toolbox.runningProcess
        if (doAfter.close)
          doAfter.close(code)
      });
    }
  }
}