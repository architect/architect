var aws = require('aws-sdk')
var parallel = require('run-parallel')
var glob = require('glob')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')
var s3 = new aws.S3

module.exports = function factory(bucket, callback) {
  return function upload() {
    console.log(`${chalk.green('Success!')} ${chalk.green.dim('Deployed .static')}`)
    console.log(chalk.cyan.dim('-------------------------'))
    var s3Path = path.join(process.cwd(), '.static', '/**/*')
    glob(s3Path, function _glob(err, files) {
      if (err) console.log(err)
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
            function _putObj(err) {
              if (err) {
                console.log(err)
                callback()
              }
              else {
                var before = file.replace(process.cwd(), '').substr(1)
                var after = before.replace('.static', '')
                var domain = `https://s3-${process.env.AWS_REGION}.amazonaws.com/`
                console.log(chalk.underline.cyan(`${domain}${bucket}${after}`))
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
  }
}
