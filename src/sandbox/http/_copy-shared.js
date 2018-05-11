var fs = require('fs')
var glob = require('glob')
var path = require('path')
var mkdir = require('mkdirp').sync

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared() {
  var src = path.join(process.cwd(), 'src', 'shared')
  var files = glob.sync(src + '/**/*', {dot:true})
  var paths = glob.sync('src/@(html|json|events|scheduled|tables|slack)/*')

  files.forEach(f=> {
    paths.forEach(pathToCode=> {
      var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
      var current = f.replace(src, dest)
      mkdir(dest)
      if (fs.statSync(f).isDirectory()) {
        mkdir(current)
      }
      else {
        fs.copyFileSync(f, current)
      }
    })
  })
}
