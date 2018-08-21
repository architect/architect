let runPluginPromise = require('./run-plugin-promise')

module.exports = function runPlugin(eventName, params, callback) {
  runPluginPromise(params, eventName)
    .then(()=> callback())
    .catch(callback)
}
