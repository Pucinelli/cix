module.exports = toolbox => {

  toolbox.tunnel = {
    forwardPort: async options => {
      const { print, parameters, configManager } = toolbox
      const localtunnel = require('localtunnel')


      await configManager.parseArgOptions(parameters.options)
      // const verboseLevel = toolbox.projectConfig.verboseLevel

      if (!options.port && !toolbox.projectConfig.portForward) {
        print.error('Error: Please specify a port to forward');
        return;
      }

      const port = options.port || toolbox.projectConfig.portForward;
      const tunnel = await localtunnel({ port });

      print.info(`Port ${port} forwarded at ${tunnel.url}`);
      // tunnel.on('request', info => print.info(info));
      tunnel.on('error', err => print.error(`Port Forwarding Error: ${err}`));
      tunnel.on('close', () => print.info(`Connection at port ${port} closed`));
      return tunnel;
    }
  }

}