/* eslint global-require:"off" */
/**
 * calls a specific plugin function in any plugins registered in .arc
 */
module.exports = function runPluginFunction(params, functionName) {
  let {arc, pathToCode, env, tick} = params
  // reads @plugins
  if (!arc.plugins) {
    if (tick) tick()
    return Promise.resolve()
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
        var has = tmp.hasOwnProperty(functionName)
        var fn = tmp[functionName]
        var valid = typeof fn === 'function'
        if (has && valid) {
          return {fn, pluginConfig}
        }
        else if (has && !valid) {
          throw TypeError(pluginName + `.${functionName} not a function`)
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
    return Promise.all(fns).then(function() {
      if (tick) tick()
    })
  }
}
