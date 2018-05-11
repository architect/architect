let path = require('path')
let series = require('run-series')
let cp = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {

  var {pathToCode} = params
<<<<<<< HEAD

  var src = path.join(process.cwd(), 'src', 'shared')
  var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  var arcFileSrc = path.join(process.cwd(), '.arc')
  var arcFileDest = path.join(dest, '.arc')
=======
  var destDir = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  var arcFileSrc = path.join(process.cwd(), '.arc')
  var arcFileDest = path.join(destDir, '.arc')
  var src = path.join(process.cwd(), 'src', 'shared')
  var files = glob.sync(src + '/**/*', {dot:true})

  // mkdir the architect/shared dir if it does not exist
  mkdir(destDir)

  // walk the files and dirs
  files.forEach(f=> {
    var current = f.replace(src, destDir)
    if (fs.statSync(f).isDirectory()) {
      mkdir(current)
    }
    else {
      fs.copyFileSync(f, current)
    }
  })
>>>>>>> 893f9d6d0a100e68c37cb14934ead689db779ddd

  series([
    function copyShared(callback) {
      cp(src, dest, {overwrite:true}, callback)
    },
    function copyArc(callback) {
      cp(arcFileSrc, arcFileDest, {overwrite:true}, callback)
    }
  ],
  function done(err) {
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

