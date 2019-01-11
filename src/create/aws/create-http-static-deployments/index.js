var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var print = require('../../_print')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    static: Array
  })

  var staging = _create.bind({}, params.app, params.static[0][1])
  var production = _create.bind({}, params.app, params.static[1][1])

  parallel([
    staging,
    production,
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}

// TODO: possibly factor into own module for easier testing
function _create(app, bucket, callback) {
  let s3 = new aws.S3({region: process.env.AWS_REGION})
  print.create('@static', bucket)
  var ok = true
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
        function _putWWW(err) {
          if (err) {
            console.log(err)
          }
          callback()
        })
      }
      else {
        callback()
      }
    }
  ], callback)
}
