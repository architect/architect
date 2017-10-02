var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var print = require('../../_print')
var s3 = new aws.S3
var chalk = require('chalk')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String
  })

  var staging = _create.bind({}, params.app, `arc-${params.app}-staging`)
  var production = _create.bind({}, params.app, `arc-${params.app}-production`)

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

function _create(app, bucket, callback) {
  print.create('@static', bucket)
  waterfall([
    function _createBukkit(callback) {
      s3.createBucket({
        Bucket: bucket,
        ACL: 'public-read'
      },
      function _bukkit(err) {
        if (err && err.code === 'BucketAlreadyOwnedByYou') {
          print.skip('@static', bucket)
        }
        else if (err) {
          console.log(err)
        }
        callback()
      })
    },
    function _putWebsite(callback) {
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
      function _putWWW(err, data) {
        if (err) {
          console.log(err)
        }
        callback()
      })
    }
  ], callback)
}
