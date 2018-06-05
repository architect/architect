let assert = require('@smallwins/validate/assert')
let chalk = require('chalk')
let mkdir = require('mkdirp').sync
let path = require('path')
let fs = require('fs')
let copyToS3 = require('./_copy-to-s3')

module.exports = function deploy(params, callback) {

  assert(params, {
    env: String,
    arc: Object,
  })

  let ignore = !params.arc.static
  if (ignore) {
    callback()
  }
  else {
    let pathToStatic = path.join(process.cwd(), '.static')
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
        let index = params.env === 'staging'? 0 : 1
        let bucket = params.arc.static[index][1]
        let upload = copyToS3(bucket, callback)
        upload()
      }
    })
  }
}
