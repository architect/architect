let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')

/**
 * @param {Object} a - {}
 * @param {Array} b - ['runtime', 'nodejs10.x']
 * @returns {Object} - {runtime: 'nodejs10.x}
 */
function invert(a, b) {
  a[b[0]] = b[1]
  return a
}

module.exports = function getPropertyHelper(arc, pathToCode) {

  // default props
  let props = {
    timeout: 5,
    memory: 1152,
    runtime: 'nodejs10.x',
    layers: [],
    state: 'n/a',
    concurrency: 'unthrottled',
  }

  // .arc global override
  if (arc.aws) {
    let globals = arc.aws.reduce(invert, {})
    props = Object.assign({}, props, globals)
  }

  // .arc-config local override
  let arcFile = path.join(pathToCode, '.arc-config')
  let exists = fs.existsSync(arcFile)
  if (exists) {
    let raw = fs.readFileSync(arcFile).toString().trim()
    let config = parse(raw)
    if (config.aws) {
      config = config.aws.reduce(invert, {})
    }
    props = Object.assign({}, props, config)
  }

  return function getProp(name) {
    return props[name]
  }
}
