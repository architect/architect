let fs = require('fs')
let path = require('path')
let spawn = require('./spawn')

module.exports = function runInNode(options, timeout, callback) {
  let node = path.join(__dirname, '/runtimes/node.js')
  fs.readFile(node, 'utf8', function done(err, data) {
    if (err) callback(err)
    else {
      let minify = script=> '"' + script.replace(/\n/g, '').trim() + '"'
      let script = minify(data.toString())
      spawn('node', ['-e', script], options, timeout, callback)
    }
  })
}
