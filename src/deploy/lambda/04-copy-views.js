let path = require('path')
let cp = require('cpr')
const lambdaPath = require('../../create/aws/_get-lambda-name')

/**
 * copies ./src/shared into lambda node_modules/@architect/views
 * If no @views exists in your .arc file it will copy to all @http GET routes, otherwise it will copy only to the specified routes.
 */
module.exports = function _views (params, callback) {
  if (params.tick) params.tick(`Copying views...`)
  let {arc, pathToCode} = params
  let views = arc.views
  let src = path.join(process.cwd(), 'src', 'views')
  let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'views')

  // @views has entries
  if (views.length) {
    let paths = views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
    // If the current lambda is in the list of views specified in your .arc file then copy views
    if (paths.includes(pathToCode)) {
      copy(src, dest, callback)
    } else {
      callback()
    }
  } else {
    // Otherwise copy to all @http GET routes
    copy(src, dest, callback)
  }

  function copy (src, dest, callback) {
    cp(src, dest, { overwrite: true },
      err => {
        if (err) {
          callback(err)
        } else {
          callback()
        }
      }
    )
  }
}
