var fs = require('fs')
var glob = require('glob')
var path = require('path')
var mkdir = require('mkdirp').sync

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared() {
  var src = path.join(process.cwd(), '.arc')
  var paths = glob.sync('src/@(html|json|events|scheduled|tables|slack)/*')
  paths.forEach(pathToCode=> {
    var base =  path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    mkdir(base)
    var dest = path.join(base, '.arc')
    fs.copyFileSync(src, dest)
  })
}
