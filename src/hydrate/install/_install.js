let assert = require('@smallwins/validate/assert')
let exists = require('path-exists').sync
let npm = require('../providers/npm')

module.exports = function install(params, callback) {

  assert(params, {
    pathToCode: Array,
    // tick: Function,
  })

  let { pathToCode, tick } = params

  let total = pathToCode.length
  if (tick) tick(`Installing dependencies in ${total} Functions`)

  // Build out the queue of dependencies that need hydrating
  let queue = []
  pathToCode.forEach(path => {
    // If user opted out of package.json and isn't using another runtime, don't bother with npm
    let package = exists(path + '/package.json')
    // let arcConfig = exists(path + '/.arc-config')

    if (package) {
      // Normalize absolute paths
      if (path.startsWith('src/')) path = process.cwd() + '/' + path
      // NPM specific impl: ci for package installation
      let args = ['ci', '--ignore-scripts']
      queue.push([path, args])
    }
  })

  npm(queue, err => {
    if (err) {
      if (tick) tick('')
      callback(err)
    }
    else {
      if (tick) tick('')
      callback()
    }
  })
}
