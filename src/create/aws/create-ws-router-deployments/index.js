let waterfall = require('run-waterfall')
let series = require('run-series')
let list = require('./list')
let deploy = require('./deploy')
let skip = require('./skip')

module.exports = function createWebSocketRouterDeployments({app}, callback) {
  waterfall([
    function reads(callback) {
      list(callback)
    },
    function writes(result, callback) {
      let staging = result.find(i=> i.Name === `${app}-ws-staging`)
      let production = result.find(i=> i.Name === `${app}-ws-production`)
      let stage = staging? deploy.bind({}, staging) : skip.bind({}, {name: app, env:'staging'})
      let prod = production? deploy.bind({}, production) : skip.bind({}, {name: app, env:'production'})
      series([
        stage,
        prod
      ], callback)
    },
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
