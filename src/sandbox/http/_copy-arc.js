var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {
  var src = path.join(process.cwd(), '.arc')
  glob('src/@(html|json|events|scheduled|tables|slack)/*', function _glob(err, paths) {
    if (err) throw err
    paths.forEach(pathToCode=> {
      var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared', '.arc')
      fs.copySync(src, dest, {overwrite:true})
    })
  })
}
