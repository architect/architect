#!/usr/bin/env node
let init = require('../util/init')
let code = require('.')

let {join} = require('path')
let fs = require('fs')
let waterfall = require('run-waterfall')

// default simple as possible .arc file
let arcFile = `@app
mytestapp

@static
@http
get /
`

// actual impl of init
function initLocal(callback) {
  console.time('init')
  let pathToArc = join(process.cwd(), '.arc')
  let pathToJSON = join(process.cwd(), 'arc.json')
  let pathToYAML = join(process.cwd(), 'arc.yaml')
  let pathToApp = join(process.cwd(), 'app.arc')
  waterfall([
    function(callback) {
      // create a basic .arc if one does not exist
      let exists = fs.existsSync(pathToArc) ||
          fs.existsSync(pathToJSON) ||
          fs.existsSync(pathToYAML) ||
          fs.existsSync(pathToApp)

      if (exists) callback()
      else {
        fs.writeFileSync(pathToArc, arcFile)
        callback()
      }
    },
    function(callback) {
      // print banner
      init(callback)
    },
    function(arc, raw, callback) {
      // create minimal local code
      code(arc, callback)
    },
    function(callback) {
      // success
      console.timeEnd('init')
      callback()
    }
  ], callback)
}

// export the cli as a module for testing
module.exports = initLocal

// if being invoked directly
if (require.main === module)
  initLocal(function noop() {})
