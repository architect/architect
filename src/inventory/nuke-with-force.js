let series = require('run-series')
let chalk = require('chalk')
let aws = require('aws-sdk')
let print = require('./nuke/_print')

/**
 * deletes persistent resources:
 *
 * - dynamodb tables
 * - s3 buckets
 */
module.exports = function _nukeWithForce(inventory) {

  let {header, deleted, notfound, error} = print(inventory)

  let db = new aws.DynamoDB({region: process.env.AWS_REGION})
  let s3 = new aws.S3({region: process.env.AWS_REGION})

  header('Force Nuke ☢︎')
  console.log(chalk.red.bold(inventory.app))

  let hasBuckets = inventory.s3buckets && inventory.s3buckets.length > 0
  if (hasBuckets) {
    header(`S3 Buckets`)
    series(inventory.s3buckets.map(Bucket=> {
      return function deleteBucket(callback) {
        s3.deleteBucket({
          Bucket
        },
        function done(err) {
          if (err && err.code === 'BucketNotEmpty') {
            // delete bucket contents..
            let items = []
            function listObjs(params, callback) {
              s3.listObjectsV2(params, function done(err, {Contents, IsTruncated, NextContinuationToken}) {
                if (err) {
                  callback(err)
                }
                else if (IsTruncated) {
                  items = items.concat(Contents)
                  listObjs({
                    Bucket: params.Bucket,
                    ContinuationToken: NextContinuationToken
                  }, callback)
                }
                else {
                  items = items.concat(Contents)
                  s3.deleteObjects({
                    Bucket: params.Bucket,
                    Delete: {
                      Objects: items.map(i=> ({Key: i.Key}))
                    },
                  },
                  function done(err) {
                    if (err) {
                      error(err.message)
                    }
                    else {
                      s3.deleteBucket({
                        Bucket
                      },
                      function done(err) {
                        if (err) {
                          error(err.message)
                        }
                        else {
                          deleted(Bucket, `arn:aws:s3:::${Bucket}`)
                        }
                        callback()
                      })
                    }
                  })
                }
              })
            }
            // kick off
            listObjs({
              Bucket
            }, callback)
          }
          else if (err && err.code === 'NoSuchBucket') {
            callback()
          }
          else if (err) {
            callback(err)
          }
          else {
            deleted(Bucket, `arn:aws:s3:::${Bucket}`)
            callback()
          }
        })
      }
    }),
    function done(err) {
      if (err) console.log(err)
    })
  }

  let hasTables = inventory.tables && inventory.tables.length > 0
  if (hasTables) {
    header(`DynamoDB Tables`)
    series(inventory.tables.map(TableName=> {
      return function _getLambda(callback) {
        db.deleteTable({TableName}, function _prettyPrint(err, result) {
          if (err && err.code === 'ResourceNotFoundException') {
            notfound(TableName)
          }
          else if (err) {
            error(err.message)
            console.log(err)
          }
          else {
            deleted(TableName, result.TableDescription.TableArn)
          }
          callback()
        })
      }
    }))
  }
}
