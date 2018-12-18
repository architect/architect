var aws = require('aws-sdk')
var parallel = require('run-parallel')
var mime = require('mime-types')
var glob = require('glob')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')

function getContentType(file) {
  var bits = file.split('.')
  var last = bits[bits.length - 1]
  return mime.lookup(last)
}

module.exports = function factory(bucket, shouldDelete, callback) {
  var s3 = new aws.S3({region: process.env.AWS_REGION})
  var staticAssets = path.join(process.cwd(), 'public', '/**/*')
  glob(staticAssets, function _glob(err, localFiles) {
    if (err) console.log(err)
    // Remove default readme.md from static asset deploys
    let readme = path.join(process.cwd(), 'public', '/readme.md')
    if (localFiles.includes(readme))
      localFiles.splice(localFiles.indexOf(readme),1)
    var tasks = localFiles.map(file=> {
      return function _maybeUploadFileToS3(callback) {
        let stats = fs.lstatSync(file)
        if (stats.isDirectory()) {
          callback() // noop
        }
        else if (stats.isFile()) {
          var key = file.replace(path.join(process.cwd(), 'public'), '').substr(1)
          s3.headObject({
            Bucket: bucket,
            Key: key,
          }, function _headObj(err, headData) {
            if (err && err.code !== 'NotFound') {
              console.error('erroring heading object', err)
              callback()
            } else {
              let last = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${bucket}/${key}`
              if (!headData || !headData.LastModified || stats.mtime > headData.LastModified) {
                s3.putObject({
                  ACL: 'public-read',
                  Bucket: bucket,
                  Key: key,
                  Body: fs.readFileSync(file),
                  ContentType: getContentType(file),
                },
                function _putObj(err) {
                  if (err) {
                    console.log(err)
                    callback()
                  }
                  else {
                    console.log(`${chalk.cyan('✈︎')} ${chalk.underline.cyan(last)}`)
                    callback()
                  }
                })
              } else {
                console.log(`${chalk.green('✓')} ${chalk.underline.green(last)}`)
                callback()
              }
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
                  let last = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${bucket}/${deletedFile.Key}`
                  console.log(`${chalk.yellow('✗')} ${chalk.underline.yellow(last)}`)
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
