let toLogicalID = require('../to-logical-id')
let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')

module.exports = function getEnv(arc) {
  let env = {
    ARC_CLOUDFORMATION: toLogicalID(arc.app[0]),
    ARC_APP_NAME: arc.app[0],
    NODE_ENV: 'production',
    SESSION_TABLE_NAME: 'jwe',
    PYTHONPATH: '/var/task/vendor:/var/runtime:/opt/python'
  }
  // this was tidy
  if (arc.static) {
    env.ARC_STATIC_BUCKET = {Ref: 'StaticBucket'}
  }
  // yikes tradeoffs... now we need to reconcile the dynamo table name w upcased env var
  if (arc.tables) {
    arc.tables.forEach(table=> {
      let tbl = Object.keys(table)[0]
      let key = `ARC_TABLE_${toLogicalID(tbl).toUpperCase()}`
      let val = {Ref: `${toLogicalID(tbl)}Table`}
      env[key] = val
    })
  }
  let arcFile = path.join('.', '.arc-env')
  let exists = fs.existsSync(arcFile)
  if (exists) {
    let raw = fs.readFileSync(arcFile).toString().trim()
    let config = parse(raw)
    if (config.production) {
      config = config.production.reduce(function invert(a, b) {
        a[b[0]] = b[1]
        return a
      }, {})
    }
    env = Object.assign({}, env, config)
  }
  return env
}
