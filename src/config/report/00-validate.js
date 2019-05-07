let series = require('run-series')
let parallel = require('run-parallel')

let _lambdas = require('./_lambdas')
let _concurrencies = require('./_concurrencies')
let _states = require('./_states')

module.exports = function validate(arc, origraw, configs, callback) {
  series(configs.map(config=> {
    return function validateOne(callback) {

      let {
        isScheduled,
        staging,
        production,
      } = config

      let concurrencies = _concurrencies.bind({}, {staging, production})
      let lambdas = _lambdas.bind({}, {staging, production})
      let states = _states.bind({}, {staging, production, isScheduled})

      parallel({
        lambdas,
        concurrencies,
        states
      },
      function done(err, {states, concurrencies, lambdas}) {
        if (err) callback(err)
        else {
          // pass state off to pretty print
          callback(null, {
            ...config,
            states,
            concurrencies,
            lambdas,
          })
        }
      })
    }
  }),
  function done(err, result) {
    if (err) callback(err)
    else {
      callback(null, arc, origraw, result)
    }
  })
}
