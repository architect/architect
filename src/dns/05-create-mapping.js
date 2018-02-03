var aws = require('aws-sdk')
var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var gw = new aws.APIGateway

function _create(params, callback) {
  assert(params, {
    name: String,
    restApiId: String,
    stage: String,
    app: String,
  })
  var {name, restApiId, stage} = params
  // rather than skip always remove then add it
  gw.getBasePathMappings({
    domainName: name,
  },
  function(err, result) {
    if (err) throw err
    var skip = result.items && result.items.length >= 1
    if (skip) {
      gw.deleteBasePathMapping({
        basePath: "(none)", // omg, this api!
        domainName: name,
      },
      function _del(err) {
        if (err) throw err
        gw.createBasePathMapping({
          domainName: name,
          restApiId,
          stage,
        },
        function _create(err) {
          if (err) throw err
          callback()
        })
      })

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
      _create.bind({}, {
        name: `staging.${domain}`,
        restApiId: staging.id,
        stage: 'staging',
        app,
      }),
      _create.bind({}, {
        name: domain,
        restApiId: production.id,
        stage: 'production',
        app,
      }),
    ], callback)
  })
}
