let path = require('path')
let cp = require('cpr')
const lambdaPath = require('../../create/aws/_get-lambda-name')

/**
 * copies ./src/shared into lambda /src/views
 */
module.exports = function _views (params, callback) {
  if (params.tick) params.tick(`Copying views...`)
  let {arc, pathToCode} = params
  let views = arc.views
  let src = path.join(process.cwd(), 'src', 'shared')
  let dest = path.join(process.cwd(), pathToCode, 'src', 'views')

  if (views.length) {
    let paths = views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
    if (paths.includes(pathToCode)) {
      copy(src, dest, callback)
    } else {
      callback()
    }
  } else {
    copy(src, dest, callback)
  }

  function copy (src, dest, callback) {
    cp(src, dest, {overwrite: true}, callback)
  }
}
