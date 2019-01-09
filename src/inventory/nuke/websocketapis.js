let aws = require('aws-sdk')
let print = require('./_print')
let waterfall = require('run-waterfall')

module.exports = function snstopics(inventory, callback) {

  let {header, notfound, error, deleted} = print(inventory)

  header('API Gateway WebSocket APIs')

  let gateway = new aws.ApiGatewayV2({region: process.env.AWS_REGION})
  gateway.getApis({}, function getApis(err, result) {
    if (err) error(err.message)
    else {

      let tidy = i=> ({name: i.Name, id: i.ApiId})
      let filter = t=> t.name.startsWith(inventory.app)
      let apis = result.Items.map(tidy).filter(filter)
      let staging = apis.find(o=> o.name === `${inventory.app}-ws-staging`)
      let production = apis.find(o=> o.name === `${inventory.app}-ws-production`)

      waterfall([
        function deleteStaging(callback) {
          if (!staging) {
            notfound(`${inventory.app}-ws-staging`)
            callback()
          }
          else {
            gateway.deleteApi({
              ApiId: staging.id
            },
            function deleteApi(err) {
              if (err) error(err.message)
              else deleted(staging.name, 'Deleted')
              callback()
            })
          }
        },
        function deleteProduction(callback) {
          if (!production) {
            notfound(`${inventory.app}-ws-production`)
            callback()
          }
          else {
            setTimeout(function delay() {
              gateway.deleteApi({
                ApiId: production.id
              },
              function deleteApi(err) {
                if (err) error(err.message)
                else deleted(production.name, 'Deleted')
                callback()
              })
            }, staging? 30*1000 : 0)
          }
        }
      ], callback)
    }
  })
}
