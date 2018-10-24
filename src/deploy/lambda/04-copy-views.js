let path = require('path')
let cp = require('cpr')
let lambdaPath = require('../../util/get-lambda-name')

function copy(src, dest, callback) {
  cp(src, dest, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}

/**
 * copies ./src/shared into lambda node_modules/@architect/views
 * If no @views exists in your .arc file it will copy to all @http GET routes, otherwise it will copy only to the specified routes.
 */
module.exports = function _views(params, callback) {

  if (params.tick)
    params.tick(`Copying views...`)

  let {arc, pathToCode} = params
  let src = path.join(process.cwd(), 'src', 'views')
  let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'views')

  // @views has entries
  if (arc.views && arc.views.length) {
    let paths = arc.views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
    // If the current lambda is in the list of views specified in your .arc file then copy views
    if (paths.includes(pathToCode)) {
      copy(src, dest, callback)
    }
    else {
      callback()
    }
  }
  else if (pathToCode.startsWith('src/http/get-')) {
    // only @http GET routes
    copy(src, dest, callback)
  }
  else {
    callback()
  }
}
