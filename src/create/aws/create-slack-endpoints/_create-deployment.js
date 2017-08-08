var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var getLambda = require('../_get-lambda')
var r = require('./_create-resource')

module.exports = function _createSlackBot(params, callback) {

  assert(params, {
    app: String,
    bot: String,
    env: String,
  })

  waterfall([
    // generates lambdas
    // - app-env-slack-bot-actions
    // - app-env-slack-bot-events
    // - app-env-slack-bot-slash
    // - app-env-slack-bot-options
    function _generateLambdas(callback) {
      var lambdas = ['actions', 'events', 'slash', 'options']
      var fns = lambdas.map(part=> {
        return function _createLambda(callback) {
          getLambda({
            section: 'slack',
            codename: `${params.bot}-${part}`,
            deployname: `${params.app}-${params.env}-slack-${params.bot}-${part}`,
          }, callback)
        }
      })
      parallel(fns, function _done(err) {
        if (err) {
          console.log(err)
        }
        callback()
      })
    },
    function _createRoutes(callback) {
      // |-botname
      // | |-actions [post]
      // | |-events  [post]
      // | |-slash   [post]
      // | '-options [post]
      function param(part) {
        return {
          app: params.app,
          env: params.env,
          route: `/${params.bot}/${part}`,
          deploy: `${params.app}-${params.env}-slack-${params.bot}-${part}`,
          type: part
        }
      }
      waterfall([
        r.bind({}, param(`events`)),
        r.bind({}, param(`actions`)),
        r.bind({}, param(`options`)),
        r.bind({}, param(`slash`)),
      ], callback)
    }
  ], callback)
}
