let assert = require('@smallwins/validate/assert')
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let cp = fs.copyFileSync
let print = require('../../_print')
let getTriggers = require('./_get-triggers')
let parallel = require('run-parallel')
let exists = require('path-exists').sync
let install = require('../_install-workflows-and-data')

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
  }
  else {
    console.log(`create: ${base}`)
    mkdir(`src/tables/${name}`)

    // write package.json
    let pathToPkg = path.join(base, 'package.json')
    let pkg = {
      name: `${app}-${name}`
    }
    fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))

    // copy in index.js
    let index = path.join(__dirname, '..', '..', 'templates', 'table-lambda', `${mthd}.js`)
    cp(index, path.join(base, 'index.js'))
  }

  install(base, callback)
}
