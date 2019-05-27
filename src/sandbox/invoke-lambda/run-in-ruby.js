let fs = require('fs')
let path = require('path')
let spawn = require('./spawn')

module.exports = function runInPython(options, timeout, callback) {
  let ruby = path.join(__dirname, '/runtimes/ruby.rb')
  fs.readFile(ruby, 'utf8', function done(err, data) {
    if (err) callback(err)
    else {
      let script = data.toString()
      let args = script.split('\n').filter(Boolean).map(line=> ['-e', `"${line}"`]).reduce((a, b)=> a.concat(b))
      spawn('ruby', args, options, timeout, callback)
    }
  })
}
