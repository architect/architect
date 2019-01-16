let assert = require('@smallwins/validate/assert')
let exists = require('path-exists').sync
let npm = require('../providers/npm')

module.exports = function update(params, callback) {

  assert(params, {
    pathToCode: Array,
    // tick: Function,
  })

  let { pathToCode, tick } = params

  let total = pathToCode.length
  if (tick) tick(`Updating dependencies in ${total} Functions`)

  // Build out the queue of dependencies that need hydrating
  let queue = []
  // If any errors at this point, bubble them before calling the package manager
  let errors = []

  pathToCode.forEach(path => {
    // TODO impl arcConfig soooooon
    // let arcConfig = exists(path + '/.arc-config')
    let package = exists(path + '/package.json')

    if (package) {
      // Normalize absolute paths
      if (path.startsWith('src/')) path = process.cwd() + '/' + path
      // NPM
      let args = ['update', '--ignore-scripts', '&&', 'npm', 'i']
      queue.push([path, args])
    }
    else {
      // Guard against missing package
      // TODO will need refactor for other package managers
      errors.push(`Missing package.json in ${path}`)
    }
  })

  // Hydrate!
  if (errors.length === 0) {
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
  else {
    if (tick) tick('')
    callback(errors)
  }
}
