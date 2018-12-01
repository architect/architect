var aws = require('aws-sdk')
var parallel = require('run-parallel')
var mime = require('mime-types')
var glob = require('glob')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')

module.exports = function factory(bucket, shouldDelete, callback) {

  var s3 = new aws.S3({region: process.env.AWS_REGION})


  var staticAssets = path.join(process.cwd(), 'public', '/**/*')
  glob(staticAssets, function _glob(err, localFiles) {
    if (err) console.log(err)
    var tasks = localFiles.map(file=> {
      return function _maybeUploadFileToS3(callback) {
        let stats = fs.lstatSync(file)
        if (stats.isDirectory()) {
          callback() // noop
        }
        else if (stats.isFile()) {
          function getContentType(file) {
            var bits = file.split('.')
            var last = bits[bits.length - 1]
            return mime.lookup(last)
          }
          s3.putObject({
            ACL: 'public-read',
            Bucket: bucket,
            Key: file.replace(path.join(process.cwd(), 'public'), '').substr(1),
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
              var after = before.replace(/^public/, '')
              var domain = `https://s3.${process.env.AWS_REGION}.amazonaws.com/`
              let last = `${domain}${bucket}${after}`
              console.log(`✓ ${chalk.underline.cyan(last)}`)
              callback()
            }
          })
        }
        else {
          callback()
        }
      }
    })
    if (shouldDelete) tasks.push(function _maybeDeleteFilesOnS3(callback) {
      s3.listObjectsV2({Bucket:bucket}, function(err, filesOnS3) {
        if (err) {
          console.error('listing objects in s3 failed', err)
          callback()
        }
        else {
          // calculate diff between files_on_s3 and local_files
          // TODO: filesOnS3.IsTruncated may be true if you have > 1000 files.
          // might want to handle that (need to ask for next page, etc)...
          var leftovers = filesOnS3.Contents.filter(function(s3File) {
            return !localFiles.includes(
              path.join(process.cwd(), 'public', s3File.Key.replace('/', path.sep)) // windows
            )
          }).map(function(s3File) {
            return {Key: s3File.Key }
          })
          if (leftovers.length) {
            var deleteParams = {
              Bucket: bucket,
              Delete: {
                Objects: leftovers,
                Quiet: false
              }
            }
            s3.deleteObjects(deleteParams, function(err, data) {
              if (err) {
                console.error('deleting objects on s3 failed', err)
              } else {
                data.Deleted.forEach(function(deletedFile) {
                  var file = path.join(process.cwd(), 'public', deletedFile.Key.replace('/', path.sep));
                  console.log(`🔪 ${chalk.underline.yellow(file)}`)
                })
              }
              callback()
            })
          } else {
            callback()
          }
        }
      })
    })
    parallel(tasks, function() {
      console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim('Deployed static assets from public' + path.sep)}`)
      callback()
    })
  })
}
