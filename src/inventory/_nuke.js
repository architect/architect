let chalk = require('chalk')
let series = require('run-series')
let aws = require('aws-sdk')
let _longest = require('./_get-longest-subject')

module.exports = function _cloud(inventory) {

  let longest = _longest(inventory)

  function title() {
    console.log(chalk.red.bold(inventory.app))
  }

  function header(msg) {
    console.log('\n'+chalk.grey.bold(msg))
  }

  function deleted(subject, arn) {
    var subj = `${subject} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.red(arn))
  }

  function notfound(msg) {
    var subj = `${msg} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.yellow('ARN not found'))
  }

  function error(msg) {
    console.log(chalk.red.bold('Error: '), chalk.white.bold(msg))
  }

  // draw some header output
  header('Inventory Nuke ☢︎')
  title()

  // walk thru the inventory
  series([
    function s3(callback) {
      header('S3 Buckets')
      let s3 = new aws.S3
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
    },
    function lambdas(callback) {
      header(`Lambda Functions (${inventory.lambdas.length})`)
      let lambda = new aws.Lambda({region:process.env.AWS_REGION})
      series(inventory.lambdas.map(FunctionName=> {
        return function _getLambda(callback) {
          lambda.deleteFunction({FunctionName}, function _prettyPrint(err) {
            if (err && err.code === 'ResourceNotFoundException') {
              notfound(FunctionName)
            }
            else if (err) {
              error(err.message)
              console.log(err)
            }
            else {
              deleted(FunctionName, 'Deleted')
            }
            callback()
          })
        }
      }), callback)
    },
    function restapis(callback) {
      header('API Gateway REST APIs')
      let api = new aws.APIGateway
      api.getRestApis({limit:500}, function _getRestApis(err, result) {
        if (err) {
          error(err.message)
          callback()
        }
        else {
          var founds = []
          var name = `${inventory.app}-staging`
          var staging = result.items.find(o=> o.name === name)
          if (staging) {
            founds.push(staging)
          }
          else {
            notfound(name)
          }
          var name = `${inventory.app}-production`
          var production = result.items.find(o=> o.name === name)
          if (production) {
            founds.push(production)
          }
          else {
            notfound(name)
          }
          let timeout = 0
          var funs = founds.map(subject=> {
            return function deleteApi(callback) {
              setTimeout(function delay() {
                timeout = 30*1000
                api.deleteRestApi({restApiId:subject.id}, function _deleted(err) {
                  if (err) {
                    callback(err)
                  }
                  else {
                    deleted(subject.name, subject.id)
                    callback()
                  }
                })
              }, timeout)
            }
          })
          series(funs, function done(err) {
            if (err) {
              error(err.message)
            }
            callback()
          })
        }
      })
    },
    function snstopics(callback) {
      header(`SNS Topics`)
      let copy = inventory.snstopics.slice(0)
      let founds = []
      let sns = new aws.SNS
      function listTopics(next, done) {
        let params = next? {NextToken:next} : {}
        sns.listTopics(params, function _listTopics(err, result) {
          if (err) {
            notfound(err.message)
            done()
          }
          else {
            var index = 0
            result.Topics.map(t=> t.TopicArn.split(':').reverse().shift()).forEach(t=> {
              if (copy.includes(t)) {
                founds.push(t)
                // found(t, result.Topics[index].TopicArn)
                let TopicArn = result.Topics[index].TopicArn
                sns.deleteTopic({TopicArn}, function _deleteTopic(err) {
                  if (err) {
                    error(err.message)
                  }
                  else {
                    deleted(t, TopicArn)
                  }
                })
              }
              index += 1
            })
            if (result.NextToken) {
              listTopics(result.NextToken, done)
            }
            else {
              done()
            }
          }
        })
      }
      listTopics(false, function finished() {
        copy.forEach(t=> {
          if (!founds.includes(t)) {
            notfound(t)
          }
        })
        callback()
      })
    }
  ])
}
