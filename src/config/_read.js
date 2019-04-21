let fs = require('fs')
let parse = require('@architect/parser')
let series = require('run-series')
let path = require('path')
let exists = require('path-exists').sync
let waterfall = require('run-waterfall')

let inventory = require('../inventory')
let getFunctionName = require('./_get-function-name')
let getLayers = require('../util/get-layers')
let getRuntime = require('../util/get-runtime')

module.exports = function report(arc, raw, callback) {
  waterfall([
    inventory.bind({}, arc, raw),
    read.bind({}, arc, raw),
  ], callback)
}


function read(arc, raw, inventory, callback) {

  let full = basepath=> path.join(basepath, '.arc-config')
  let configs = inventory.localPaths.map(full).filter(exists)

  series(configs.map(arcFile=> {
    return function validateOne(callback) {
      try {

        let appname = arc.app[0]
        let raw = fs.readFileSync(arcFile).toString().trim()
        let config = parse(raw)
        let isScheduled = arcFile.includes('scheduled')

        // default config
        let staging = getFunctionName(appname, 'staging', arcFile)
        let production = getFunctionName(appname, 'production', arcFile)
        let timeout = 5
        let memory = 1152
        let runtime = getRuntime(config)
        let layers = []
        let state = isScheduled? 'enabled' : 'n/a'
        let concurrency = 'unthrottled'

        if (config && config.aws) {
          timeout = config.aws.find(e=> e[0] === 'timeout') || 5
          memory = config.aws.find(e=> e[0] === 'memory') || 1152
          runtime = config.aws.find(e=> e[0] === 'runtime') || getRuntime(config) // default runtime
          layers = config.aws.find(e=> e[0] === 'layer') || []
          state = config.aws.find(e=> e[0] === 'state') || (isScheduled? 'enabled' : 'n/a')
          concurrency = config.aws.find(e=> e[0] === 'concurrency') || 'unthrottled'
          if (Array.isArray(timeout))
            timeout = timeout[1]
          if (Array.isArray(memory))
            memory = memory[1]
          if (Array.isArray(runtime))
            runtime = getRuntime(config)
          if (layers.length)
            layers = getLayers(config)
          if (Array.isArray(state))
            state = state[1]
          if (Array.isArray(concurrency))
            concurrency = concurrency[1]
        }

        callback(null, {
          arcFile,
          isScheduled,
          staging,
          production,
          timeout,
          memory,
          runtime,
          layers,
          state,
          concurrency,
        })
      }
      catch(e) {
        callback(e)
      }
    }
  }), callback)
}
