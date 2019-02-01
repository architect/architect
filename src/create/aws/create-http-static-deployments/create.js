var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var print = require('../../_print')

module.exports = function create(app, bucket, callback) {
  let ok = true
  let region = process.env.AWS_REGION
  let s3 = new aws.S3({region})
  print.create('@static', bucket)
  waterfall([
    function _createBukkit(callback) {
      s3.createBucket({
        Bucket: bucket,
        ACL: 'public-read'
      },
      function _bukkit(err) {
        if (err && err.code === 'BucketAlreadyOwnedByYou') {
          ok = false
          print.skip('@static', bucket)
        }
        else if (err && err.code === 'BucketAlreadyExists') {
          ok = false
          print.skip('@static', bucket)
        }
        else if (err) {
          ok = false
          console.log(err)
        }
        callback()
      })
    },
    function _putWebsite(callback) {
      if (ok) {
        s3.putBucketWebsite({
          Bucket: bucket,
          WebsiteConfiguration: {
            ErrorDocument: {
              Key: "error.html"
            },
            IndexDocument: {
              Suffix: "index.html"
            }
          }
        },
        function done(err) {
          if(err)callback(err)
          else callback()
        })
      }
      else {
        callback()
      }
    }
  ], callback)
}
