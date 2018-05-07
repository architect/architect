var fs = require('fs')
var path = require('path')
var mkdir = require('mkdirp').sync

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {

  var {pathToCode} = params
  var destDir = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  var arcFileSrc = path.join(process.cwd(), '.arc')
  var arcFileDest = path.join(destDir, '.arc')

  // mkdir the architect/shared dir if it does not exist
  mkdir(destDir)

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
