let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let readArc = require('../../util/read-arc')
let lambdaPath = require('../../util/get-lambda-name')
let cp = require('cpr')
let parallel = require('run-parallel')

/**
 * copies ./src/views into lambda ./node_modules/@architect/views
 * if @views exists in .arc file it will only copy into the routes specifed there
 */
module.exports = function _views(callback) {

  let src = path.join(process.cwd(), 'src', 'views')
  let parsed = readArc()
  let arc = parsed.arc
  let views = arc.views
  let paths

  // If @views is defined in .arc then use those route paths
  if (views && views.length) {
    paths = views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
  }
  else {
    // Else copy into all the @http gets
    paths = glob.sync('src/@(http)/get-*')
  }

  // create a collection of fns to copy each path
  let fns = paths.map(p=> {
    return function copy(callback) {
      let dest = path.join(process.cwd(), p, 'node_modules', '@architect', 'views')
      cp(src, dest, {overwrite: true}, callback)
    }
  })

  // run them in parallel
  parallel(fns, function done(err) {
    if (err) callback(err)
    else {
      let g = chalk.green.dim
      let d = chalk.grey
      console.log(g('✓'), d('src/views copied to lambda node_modules/@architect/views'))
      callback()
    }
  })
}
