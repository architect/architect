var glob = require('glob')
var parallel = require('run-parallel')
var exec = require('child_process').exec
var noop = x=>!x

/**
 * executes cmd string in a child process for all .arc defined lambdas in ./src
 */
module.exports = function _exec(cmd, callback) {
  if (!callback) {
    callback = noop
  }
  parallel([
    'src/html/*',
    'src/json/*',
    'src/events/*',
    'src/scheduled/*',
    'src/tables/*',
    'src/indexes/*',
  ].map(p=> {
    return function _g(callback) {
      glob(p, callback)
    }
  }),
  function _done(e, r) {
    if (e) throw e
    parallel([].concat.apply([], r).map(p=> {
      return function _i(callback) {
        console.log(p)
        exec(`
          cd ${p}
          ${cmd}
        `,
        function(err, stdout, stderr) {
          if (err) console.log(err)
          console.log(stdout.trim())
          console.log(stderr.trim())
          callback()
        })
      }
    }), callback)
  })
}
