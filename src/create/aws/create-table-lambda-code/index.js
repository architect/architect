let assert = require('@smallwins/validate/assert')
let mkdir = require('mkdirp').sync
let getTriggers = require('./_get-triggers')
let parallel = require('run-parallel')
let createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    table: Object,
    app: String,
    arc: Object,
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
        createTrigger(params.app, params.arc, name, method, callback)
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

function createTrigger(app, arc, table, mthd, callback) {

  let name = `${table}-${mthd}`

  createCode({
    space: 'tables',
    idx: name, // foo-update
    app,
    arc,
  }, callback)
}
