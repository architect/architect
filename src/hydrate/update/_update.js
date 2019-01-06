let npm = require('../providers/npm')

module.exports = function update(params, callback) {
  let { pathToCode, tick } = params

  let total = pathToCode.length
  if (tick) tick(`Updating dependencies in ${total} Functions`)

  // Build out the queue of dependencies that need hydrating
  let queue = []
  pathToCode.forEach(path => {
    // Normalize absolute paths
    if (path.startsWith('src/')) path = process.cwd() + '/' + path
    // NPM specific impl: ci for package installation
    let args = ['update', '--ignore-scripts']
    queue.push([path, args])
  })

  npm(queue, err => {
    if (err) {
      callback(err)
    }
    else {
      if (tick) tick('')
      callback()
    }
  })
}
