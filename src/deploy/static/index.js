var assert = require('@smallwins/validate/assert')
var chalk = require('chalk')
var mkdir = require('mkdirp').sync
var path = require('path')
var fs = require('fs')
//var waterfall = require('run-waterfall')
var copyToS3 = require('./_copy-to-s3')

module.exports = function deploy(params, callback) {

  assert(params, {
    env: String,
    arc: Object,
  })

  var ignore = !params.arc.static
  if (ignore) {
    callback()
  }
  else {
    var pathToStatic = path.join(process.cwd(), '.static')
    // create .static if it does exist
    mkdir(pathToStatic)
    // see if there are files in .static
    fs.readdir(pathToStatic, function _readdir(err, items) {
      if (err) console.log(err)
      if (items.length === 0) {
        console.log(chalk.dim('skip @static deploy (.static is empty)'))
        callback()
      }
      else {
        var index = params.env === 'staging'? 0 : 1
        var bucket = params.arc.static[index][1]
        var upload = copyToS3(bucket, callback)
        upload()
      }
    })
  }
}
