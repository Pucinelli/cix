module.exports = {
  name: 'new',
  alias: 'n',
  run: async toolbox => {
    const path = require('path')
    const { print, parameters, filesystem } = toolbox

    if (!parameters.first) {
      print.error('Error: No name specified')
      return
    }

    
    
    const name = parameters.first.includes(filesystem.separator)
      ? parameters.first.substr(parameters.first.indexOf(filesystem.separator))
      : parameters.first
    
    filesystem.existsAsync(parameters.first)
      .then(res => {
        if (!res) {
          filesystem.dir(parameters.first)
            .write('cix.json', {
              name,
              platform: {
                name: 'mavex'
              }
            })
        } else {
          print.error(`There is already a file named ${parameters.first}`)
        }
      }).catch(err => {
        print.error(`Error: could not create a file named ${name}`)
      })
  }
}
