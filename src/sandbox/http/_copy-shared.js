var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared() {
  var src = path.join(process.cwd(), 'src', 'shared')
  var exists = fs.pathExistsSync(src)
  if (exists) {
    var paths = glob.sync('src/@(html|json|events|scheduled|tables|slack)/*')
    paths.forEach(pathToCode=> {
      var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
      fs.removeSync(dest)
      fs.copySync(src, dest, {overwrite:true})
    })
  }
}
