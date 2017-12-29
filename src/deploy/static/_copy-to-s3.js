var aws = require('aws-sdk')
var parallel = require('run-parallel')
var glob = require('glob')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')
var s3 = new aws.S3
var key = ""
var done = false

module.exports = function factory(bucket, callback) {
  return function upload(keyPath) {
    var s3Path = path.join(process.cwd(), '.static', '/**/*')
    glob(s3Path, function _glob(err, files) {
      //console.log(files)  
      var fns = files.map(file=> {
        return function _maybeUpload(callback) {
          let stats = fs.lstatSync(file)
          if (stats.isDirectory()) {
            callback() // noop
          }
          else if (stats.isFile()) {
             function getContentType(file) {
               var bits = file.split('.')
               var last = bits[bits.length - 1]
               if (last === 'html') {
                 return 'text/html'
               }
               else if (last === 'js') {
                  return 'text/javascript' 
               }
               else if (last === 'css') {
                 return 'text/css'
               }
               else {
                 return 'binary/octet-stream'
               }
             }
            s3.putObject({
              ACL: 'public-read', 
              Bucket: bucket, 
              Key: file.replace(path.join(process.cwd(), '.static'), '').substr(1),
              Body: fs.readFileSync(file),
              ContentType: getContentType(file),
            }, 
            function _putObj(err, data) {
              if (err) {
                console.log(err)
                callback()
              } 
              else {
                console.log(data)
                console.log(chalk.green(`deployed ${file} to ${bucket}`))
                callback()
              }
            })
          }
          else {
            callback() 
          }
        }
      })
      parallel(fns, callback)
    })
    /*
    var s3Path = path.join(process.cwd(), '.static')
    let fullPath = path.join(s3Path, keyPath || key)
    fs.readdirSync(fullPath).forEach(file=> {
      let stats = fs.lstatSync(path.join(fullPath, file))
      if (stats.isDirectory()) {
        key = path.join(key, file)
        upload(key)
      }
      else if (stats.isFile()) {
        s3.putObject({
          ACL: 'public-read', 
          Bucket: bucket, 
          Key: path.join(key, file), 
          Body: fs.readFileSync(path.join(fullPath, file)) 
        }, 
        function _putObj(err, data) {
          if (err) {
            console.log(err)
          } 
          else {
            setTimeout(function() {callback()}, 10000)
            console.log(chalk.green(`.static deployed to ${bucket}`))
          }
        })
      }
    })
    */
  }
}
