var aws = require('aws-sdk')
var chalk = require('chalk')
var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')

module.exports = function createRouters(params, callback) {

  assert(params, {
    app: String,
  })

  var gateway = new aws.APIGateway

  function deploy(params, callback) {
    setTimeout(function _chill() {
      gateway.createDeployment(params, function _deploy(err) {
        if (err) {
          callback(err)
        }
        else {
          // lol, ok
          // https://forums.aws.amazon.com/thread.jspa?threadID=247394
          var url = `https://${params.restApiId}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${params.stageName.startsWith('staging')?'staging':'production'}`
          callback(null, url)
        }
      })
    }, 6000)
  }

  function list(callback) {
    setTimeout(function _chill() {
      gateway.getRestApis({
        limit: 500,
      }, callback)
    }, 6000)
  }

  list(function _list(err, result) {
    if (err) {
      throw err
    }
    else {

      var stagingID = result.items.find(i=> i.name === `${params.app}-staging`).id
      var productionID = result.items.find(i=> i.name === `${params.app}-production`).id

      var staging = deploy.bind({}, {restApiId:stagingID, stageName:'staging'})
      var production = deploy.bind({}, {restApiId:productionID, stageName:'production'})

      parallel([
        staging,
        production,
      ],
      function _create(err, urls) {
        if (err) {
          console.log(err)
          callback(err)
        }
        if (urls) {
          console.log('\n')
          console.log(chalk.cyan.dim('successfully deployed'))
          urls.forEach(url=> {
            var pretty = chalk.cyan.underline(url)
            console.log(pretty)
          })
          console.log('\n')
        }
        callback()
      })
    }
  })
}
