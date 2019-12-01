const { build } = require('gluegun')

const formatArgs = argv => {
  const params = argv.map((arg, i) => ({ arg, i })).filter(it => it.arg.startsWith('-v'))
  for (const param of params) {
    const count = param.arg.split('-')[1].length
    if (argv[param.i + 1] !== count)
      argv.splice(param.i + 1, 0, count)
  }
}

const run = async argv => {
  const cli = build()
    .brand('cix')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'cix-*', hidden: true })
    .help()
    .version()
    .create()

  formatArgs(argv)

  const toolbox = await cli.run(argv)
  return toolbox
}

module.exports = { run }
