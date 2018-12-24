let exists = require('path-exists').sync
let path = require('path')
let cp = require('cpr')
let lambdaPath = require('../../util/get-lambda-name')

function copy(src, dest, callback) {
  cp(src, dest, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}

module.exports = function _views(params, callback) {

  if (params.tick)
    params.tick(`Copying views...`)

  let {arc, pathToCode} = params
  let src = path.join(process.cwd(), 'src', 'views')
  let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'views')
  let hasViews = exists(src)

  // @views has entries
  if (hasViews && arc.views && arc.views.length) {
    let paths = arc.views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
    // If the current lambda is in the list of views specified in your .arc file then copy views
    if (paths.includes(pathToCode)) {
      copy(src, dest, callback)
    }
    else {
      callback()
    }
  }
  else if (hasViews && pathToCode.startsWith('src/http/get-')) {
    // only @http GET routes
    copy(src, dest, callback)
  }
  else {
    callback()
  }
}
