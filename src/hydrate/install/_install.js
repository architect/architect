let assert = require('@smallwins/validate/assert')
let exists = require('path-exists').sync
let join = require('path').join
let npm = require('../providers/npm')
let sep = require('path').sep

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
  // If any errors at this point, bubble them before calling the package manager
  let errors = []

  pathToCode.forEach(path => {
    // For create: first check to see if this Function exists
    // If not, throw standard create error
    if (!exists(path)) {
      if (tick) Array(7).fill().map(()=> tick(''))
      callback(Error('cancel_not_found'))
    }
    // TODO impl arcConfig soooooon
    // let arcConfig = exists(join(path, '.arc-config'))
    let package = exists(join(path, 'package.json'))

    if (package) {
      // Normalize absolute paths
      if (path.startsWith(`src${sep}`)) path = join(process.cwd(), path)
      // NPM specific impl: ci for package installation
      let args = ['ci', '--ignore-scripts']
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
