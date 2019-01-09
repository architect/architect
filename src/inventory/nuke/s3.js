let aws = require('aws-sdk')
let series = require('run-series')
let print = require('./_print')

module.exports = function s3(inventory, callback) {
  let {header, notfound, error, deleted} = print(inventory)
  if (inventory.s3buckets.length > 0)
    header('S3 Buckets')
  let s3 = new aws.S3({region: process.env.AWS_REGION})
  series(inventory.s3buckets.map(Bucket=> {
    return function _getBucket(callback) {
      s3.deleteBucket({Bucket}, function _prettyPrint(err) {
        if (err && err.code === 'NoSuchBucket') {
          notfound(Bucket)
        }
        else if (err) {
          error(err.message)
        }
        else {
          deleted(Bucket, `arn:aws:s3:::${Bucket}`)
        }
        callback()
      })
    }
  }), callback)
}
