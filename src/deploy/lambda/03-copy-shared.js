var fs = require('fs')
var path = require('path')
var mkdir = require('mkdirp').sync
var glob = require('glob')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {

  var {pathToCode} = params
  var destDir = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  var arcFileSrc = path.join(process.cwd(), '.arc')
  var arcFileDest = path.join(destDir, '.arc')
  var src = path.join(process.cwd(), 'src', 'shared')
  var files = glob.sync(src + '/**/*')

  // mkdir the architect/shared dir if it does not exist
  mkdir(destDir)
  files.forEach(f=> {
    fs.copyFileSync(f, f.replace(src, destDir))
  })

  // overwrite architec/shared/.arc
  fs.copyFile(arcFileSrc, arcFileDest, function _copyFile(err) {
    if (params.tick) {
      params.tick()
    }
    // move along
    if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}

