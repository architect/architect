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

  let {pathToCode, tick} = params
  let total = pathToCode.length
  if (tick) tick(`Installing dependencies in ${total} Functions`)

  // Build out the queue of dependencies that need hydrating
  let queue = []

  pathToCode.forEach(path => {
    // For create: first check to see if this Function exists
    // If not, throw standard create error
    if (!exists(path)) {
      if (tick) Array(7).fill().map(()=> tick(''))
      callback(Error(`cancel_not_found: ${pathToCode}`))

    }
    else if (exists(join(path, 'package.json'))) {
      if (path.startsWith(`src${sep}`))
        path = join(process.cwd(), path)
      return [path, ['ci', '--ignore-scripts']]
    }
    else {
      if (tick)
        Array(7).fill().map(()=> tick(''))
      return // no deps is ok
    }
  }).filter(Boolean)

  if (queue.length > 0) {
    npm(queue, function done(err) {
      if (tick) tick('')
      if (err) callback(err)
      else callback()
    })
  }
  else {
    callback()
  }
}
