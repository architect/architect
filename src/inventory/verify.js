let chalk = require('chalk')
let series = require('run-series')
let aws = require('aws-sdk')
let _longest = require('./_get-longest-subject')

module.exports = function _cloud(inventory) {

  let longest = _longest(inventory)

  function title() {
    console.log(chalk.cyan.bold(inventory.app))
  }

  function header(msg) {
    console.log('\n'+chalk.grey.bold(msg))
  }

  function found(subject, arn) {
    var subj = `${subject} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.green(arn))
  }

  function notfound(msg) {
    var subj = `${msg} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.yellow('ARN not found'))
  }

  function error(msg) {
    console.log(chalk.red.bold('Error: '), chalk.white.bold(msg))
  }

  // draw some header output
  header('Inventory Verify')
  title()

  // walk thru the inventory
  series([
    function checkIAM(callback) {
      header('IAM Roles')
      let iam = new aws.IAM
      series(inventory.iamroles.map(RoleName=> {
        return function _getRole(callback) {
          iam.getRole({RoleName}, function _prettyPrint(err, result) {
            if (err && err.code === 'NoSuchEntity') {
              notfound(RoleName)
            }
            else if (err) {
              error(err.message)
            }
            else {
              found(RoleName, result.Role.Arn)
            }
            callback()
          })
        }
      }), callback)
    },
    function s3(callback) {
      if (inventory.s3buckets.length > 0)
        header('S3 Buckets')
      let s3 = new aws.S3({region: process.env.AWS_REGION})
      series(inventory.s3buckets.map(Bucket=> {
        return function _getBucket(callback) {
          s3.headBucket({Bucket}, function _prettyPrint(err) {
            if (err && err.code === 'NotFound') {
              notfound(Bucket)
            }
            else if (err) {
              error(err.message)
            }
            else {
              found(Bucket, `arn:aws:s3:::${Bucket}`)
            }
            callback()
          })
        }
      }), callback)
    },
    function restapis(callback) {
      if (inventory.types.http.length === 0) {
        callback()
      }
      else {
        header('API Gateway REST APIs')
        let api = new aws.APIGateway({region: process.env.AWS_REGION})
        api.getRestApis({
          limit: 500
        },
        function _getRestApis(err, result) {
          if (err) {
            error(err.message)
            callback()
          }
          else {
            var name = `${inventory.app}-staging`
            var staging = result.items.find(o=> o.name === name)
            if (staging) {
              found(staging.name, staging.id)
            }
            else {
              notfound(name)
            }
            var name = `${inventory.app}-production`
            var production = result.items.find(o=> o.name === name)
            if (production) {
              found(production.name, production.id)
            }
            else {
              notfound(name)
            }
          }
          callback()
        })
      }
    },
    function websocketapis(callback) {
      if (inventory.websocketapis.length > 0) {
        header('API Gateway WebSocket APIs')
        let api = new aws.ApiGatewayV2({region: process.env.AWS_REGION})
        api.getApis({}, function getApis(err, result) {
          if (err) {
            error(err.message)
          }
          else {
            let apis = result.Items.map(i=> ({name: i.Name, id: i.ApiId})).filter(t=> t.name.startsWith(inventory.app))
            var name = `${inventory.app}-ws-staging`
            var staging = apis.find(o=> o.name === name)
            if (staging) {
              found(staging.name, staging.id)
            }
            else {
              notfound(name)
            }
            var name = `${inventory.app}-ws-production`
            var production = apis.find(o=> o.name === name)
            if (production) {
              found(production.name, production.id)
            }
            else {
              notfound(name)
            }
          }
          callback()
        })
      }
      else {
        callback()
      }
    },
    function lambdas(callback) {
      header(`Lambda Functions (${inventory.lambdas.length})`)
      let lambda = new aws.Lambda({region:process.env.AWS_REGION})
      series(inventory.lambdas.map(FunctionName=> {
        return function _getLambda(callback) {
          lambda.getFunction({FunctionName}, function _prettyPrint(err, result) {
            if (err && err.code === 'ResourceNotFoundException') {
              notfound(FunctionName)
            }
            else if (err) {
              error(err.message)
              console.log(err)
            }
            else {
              found(FunctionName, result.Configuration.FunctionArn)
            }
            callback()
          })
        }
      }), callback)
    },
    function tables(callback) {
      if (inventory.tables.length > 0)
        header(`DynamoDB Tables`)
      let db = new aws.DynamoDB({region: process.env.AWS_REGION})
      series(inventory.tables.map(TableName=> {
        return function _getLambda(callback) {
          db.describeTable({TableName}, function _prettyPrint(err, result) {
            if (err && err.code === 'ResourceNotFoundException') {
              notfound(TableName)
            }
            else if (err) {
              error(err.message)
              console.log(err)
            }
            else {
              found(TableName, result.Table.TableArn)
            }
            callback()
          })
        }
      }), callback)
    },
    function sqstopics(callback) {
      if (inventory.sqstopics.length > 0)
        header(`SQS Topics`)
      let copy = inventory.sqstopics.slice(0)
      //let founds = []
      let sqs = new aws.SQS({region: process.env.AWS_REGION})
      sqs.listQueues({
        QueueNamePrefix: inventory.app
      },
      function listQueues(err, result) {
        if (err) {
          error(err.message)
          callback()
        }
        else if (result && result.QueueUrls) {
          let working = result.QueueUrls.map(u=> ([u.split('/').reverse().shift(), u]))
          working.forEach(a=> found.apply({}, a))
        }
        else {
          copy.forEach(notfound)
        }
      })
    },
    function snstopics(callback) {
      if (inventory.snstopics.length > 0)
        header(`SNS Topics`)
      let copy = inventory.snstopics.slice(0)
      let founds = []
      let sns = new aws.SNS({region: process.env.AWS_REGION})
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
                found(t, result.Topics[index].TopicArn)
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
