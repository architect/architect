let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')

module.exports = function getPropertyHelper(pathToCode) {
  let props = {
    timeout: 5,
    memory: 1152,
    runtime: 'nodejs10.x',
    layers: [],
    state: 'n/a',
    concurrency: 'unthrottled',
  }
  // read .arc-config
  let arcFile = path.join(pathToCode, '.arc-config')
  let exists = fs.existsSync(arcFile)
  if (exists) {
    let raw = fs.readFileSync(arcFile).toString().trim()
    let config = parse(raw)
    if (config.aws) {
      config = config.aws.reduce(function invert(a, b) {
        a[b[0]] = b[1]
        return a
      }, {})
    }
    props = Object.assign({}, props, config)
  }
  return function getProp(name) {
    return props[name]
  }
}
