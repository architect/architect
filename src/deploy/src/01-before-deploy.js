/* eslint global-require:"off" */
/**
 * calls any plugins registered in .arc with beforeDeploy
 */
module.exports = function _plugins(params, callback) {
  let {arc, pathToCode, env} = params
  // reads @plugins
  if (!arc.plugins) {
    if (params.tick) params.tick()
    callback()
  }
  else {
    // get the list of plugins
    var fns = arc.plugins.map(plugin=> {
      try {
        var pluginName
        var pluginConfig
        if (typeof plugin === 'object') {
          pluginName = Object.keys(plugin)[0]
          pluginConfig = plugin[pluginName]
        } else {
          pluginName = plugin
        }

        var tmp = require(pluginName)
        var has = tmp.hasOwnProperty('beforeDeploy')
        var valid = typeof tmp.beforeDeploy === 'function'
        if (has && valid) {
          return { fn: tmp.beforeDeploy, pluginConfig }
        }
        else if (has && !valid) {
          throw TypeError(pluginName + '.beforeDeploy not a function')
        }
        else {
          return false
        }
      }
      catch(e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          throw ReferenceError('Arc plugin "' + pluginName + '" not found')
        }
        throw e
      }
    }).filter(Boolean).map(plugin=> plugin.fn({arc, pathToCode, env, pluginConfig: plugin.pluginConfig}))
    // invoke them all concurrently (could be a problem! we probably want sequentially?)
    Promise.all(fns).then(function() {
      if (params.tick) params.tick()
      callback()
    }).catch(callback)
  }
}
