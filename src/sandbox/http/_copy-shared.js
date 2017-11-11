var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {
  var src = path.join(process.cwd(), 'src', 'shared')
  var exists = fs.pathExistsSync(src) 
  if (exists) {
    glob('src/@(html|json|events|scheduled|tables|slack)/*', function _glob(err, paths) {
      if (err) throw err
      paths.forEach(pathToCode=> {
        var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
        fs.copySync(src, dest, {overwrite:true})
      })
    })
  }
}
