let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let parallel = require('run-parallel')
let series = require('run-series')
let route = require('./route')

module.exports = function create({name, env}, callback) {

  let region = process.env.AWS_REGION
  waterfall([

    function chill(callback) {
      setTimeout(function delay() {
        callback()
      }, 30*1000)
    },

    function createApi(callback) {

      parallel({
        account(callback) {
          let sts = new aws.STS({region})
          sts.getCallerIdentity({}, function _getIdx(err, result) {
            if (err) callback(err)
            else {
              callback(null, result.Account)
            }
          })
        },
        api(callback) {
          let gateway = new aws.ApiGatewayV2({region})
          gateway.createApi({
            Name: `${name}-ws-${env}`,
            ProtocolType: 'WEBSOCKET',
            RouteSelectionExpression: '$request.body.message'
          }, callback)
        }
      }, callback)
    },

    function createRoutes({api, account}, callback) {
      // console.log('create-ws-router createRoutes got', {api, account})
      series(['$default', '$connect', '$disconnect'].map(RouteKey=> {
        return function createRoute(callback) {
          route({
            api,
            env,
            name,
            region,
            account,
            RouteKey,
          }, callback)
        }
      }), callback)
    }
  ],
  function done(err) {
    if (err) callback(err)
    else {
      callback()
    }
  })
}
