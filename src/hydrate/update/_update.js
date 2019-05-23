let assert = require('@smallwins/validate/assert')
let exists = require('path-exists').sync
let join = require('path').join
let npm = require('../providers/npm')
let sep = require('path').sep

module.exports = function update(params, callback) {

  assert(params, {
    pathToCode: Array,
    // tick: Function,
  })

  let {pathToCode, tick} = params

  let total = pathToCode.length

  if (tick)
    tick(`Updating dependencies in ${total} Functions`)

  // Build out the queue of dependencies that need hydrating
  let queue = pathToCode.map(path=> {
    if (exists(join(path, 'package.json'))) {
      if (path.startsWith(`src${sep}`))
        path = join(process.cwd(), path)
      return [path, ['update', '--ignore-scripts', '&&', 'npm', 'i']]
    }
    else {
      return
    }
  }).filter(Boolean)

  // Hydrate!
  if (queue.length > 0) {
    npm(queue, function done(err) {
      if (tick) tick('')
      if (err) callback(err)
      else callback()
    })
  }
  else {
    if (tick)
      tick('')
    callback()
  }
}
