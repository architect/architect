var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var parallel = require('run-parallel')
var gw = new aws.APIGateway

function _create(name, restApiId, stage, callback) {
  gw.getBasePathMappings({
    domainName: name,
  },
  function(err, result) {
    if (err) throw err
    var skip = result.items && result.items.length >= 1
    if (skip) {
      callback()
    }
    else {
      gw.createBasePathMapping({
        domainName: name,
        restApiId,
        stage,
      },
      function _create(err) {
        if (err) throw err
        callback()
      })
    }
  })
}

module.exports = function createMapping(app, domain, callback) {
  gw.getRestApis({
    limit: 500,
  },
  function _list(err, result) {
    if (err) throw err
    var stagingName = `${app}-staging`
    var productionName = `${app}-production`
    var staging = result.items.find(i=> i.name === stagingName)
    var production = result.items.find(i=> i.name === productionName)
    if (!staging) throw Error(`missing api! ${staging} not found`)
    if (!production) throw Error(`missing api! ${production} not found`)
    waterfall([
      _create.bind({}, `staging.${domain}`, staging.id, 'staging'),
      _create.bind({}, domain, production.id, 'production'),
    ], callback)
  })
}
