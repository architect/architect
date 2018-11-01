let series = require('run-series')
let assert = require('@smallwins/validate/assert')
let path = require('path')
let mkdir = require('mkdirp').sync
//let fs = require('fs')
let print = require('../../_print')
let getTriggers = require('./_get-triggers')
let parallel = require('run-parallel')
let exists = require('path-exists').sync
let install = require('../_install-workflows-and-data')
let _createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    table: Object,
    app: String,
  })

  let name = Object.keys(params.table)[0] // table name
  let attr = params.table[name]           // table attributes
  let mthd = getTriggers(attr)            // table triggers or false

  // non destructive setup dir
  mkdir('src')
  mkdir('src/tables')

  if (mthd) {
    // create triggers
    let fns = mthd.map(method=> {
      return function _createTriggerCode(callback) {
        // appname-tablename-insert | src/tables/tablename-insert
        createTrigger(params.app, name, method, callback)
      }
    })
    parallel(fns, function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
  else {
    // continue
    callback()
  }
}

function createTrigger(app, table, mthd, callback) {

  let name = `${table}-${mthd}`
  let base = path.join(process.cwd(), 'src', 'tables', name)
  let baseExists = exists(base)

  if (baseExists) {
    // skip if that dir exists
    print.skip('@tables', `src/tables/${name}`)
    install(base, callback)
  }
  else {
    series([
      function before(callback) {
        _createCode({
          space: 'tables',
          idx: name, // foo-update
          app,
        }, callback)
      },
      function after(callback) {
        install(base, callback)
      },
    ], callback)
  }
}
