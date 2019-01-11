let aws = require('aws-sdk')
let chalk = require('chalk')
let waterfall = require('run-waterfall')
let parallel = require('run-parallel')
let list = require('./list')
let deploy = require('./deploy')
let skip = require('./skip')

module.exports = function createWebSocketRouterDeployments(params, callback) {
  waterfall([
    function reads(callback) {
      list(callback)
    },
    function writes(result, callback) {
      let staging = result.find(i=> i.Name === `${params.app}-ws-staging`)
      let production = result.find(i=> i.Name === `${params.app}-ws-production`)
      let stage = staging? deploy.bind({}, staging) : skip.bind({}, {name: params.app, env:'staging'})
      let prod = production? deploy.bind({}, production) : skip.bind({}, {name: params.app, env:'production'})
      parallel([
        stage,
        prod
      ], callback)
    },
    function reports(results, callback) {
      let gateway = new aws.ApiGatewayV2({region: process.env.AWS_REGION})
      parallel(results.map(ApiId=> {
        return function report(callback) {
          gateway.getApi({
            ApiId
          }, callback)
        }
      }), callback)
    }
  ],
  function done(err, result) {
    if (err) callback(err)
    else {
      render(result)
      setTimeout(function delay() {
        callback()
      }, 5 * 1000)
    }
  })
}

function render(apis) {
  let log = console.log
  apis.forEach(api=> {
    let e = api.ApiEndpoint
    log(chalk.green.bold.dim(api.Name))
    log(chalk.cyan.underline(e))
    log(chalk.cyan.underline(e.replace('wss://', 'https://') + '/@connections\n\n'))
  })
}
