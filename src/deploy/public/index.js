let assert = require('@smallwins/validate/assert')
let mkdir = require('mkdirp').sync
let path = require('path')
let fs = require('fs')
let copyToS3 = require('./_copy-to-s3')

module.exports = function deploy(params, callback) {
  assert(params, {
    env: String,
    arc: Object
  })

  let ignore = !params.arc.static
  if (ignore) {
    callback()
  }
  else {
    let shouldDelete = params.shouldDelete
    let pathToPublic = path.join(process.cwd(), 'public')
    // create public if it does not exist
    mkdir(pathToPublic)
    // see if there are files in public
    fs.readdir(pathToPublic, function _readdir (err, items) {
      if (err) console.log(err)
      if (items.length === 0) {
        callback()
      }
      else {
        let index = params.env === 'staging' ? 0 : 1
        let bucket = params.arc.static[index][1]
        copyToS3(bucket, shouldDelete, callback)
      }
    })
  }
}
