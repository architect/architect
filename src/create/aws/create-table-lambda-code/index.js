var assert = require('@smallwins/validate/assert')
var path = require('path')
var mkdir = require('mkdirp').sync
var exec = require('child_process').exec
var fs = require('fs')
var cp = require('cp').sync
var print = require('../../_print')
var getTriggers = require('./_get-triggers')
var parallel = require('run-parallel')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    table: Object,
    app: String,
  })

  var name = Object.keys(params.table)[0] // table name
  var attr = params.table[name]           // table attributes
  var mthd = getTriggers(attr)            // table triggers or false

  // non destructive setup dir
  mkdir('src')
  mkdir('src/tables')

  if (mthd) {
    // create triggers
    var fns = mthd.map(method=> {
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
  var name = `${table}-${mthd}`
  //var p = path.join(process.cwd(), 'src', 'tables', name)
  var base = path.join(process.cwd(), 'src', 'tables', name)
  var exists = fs.existsSync(base)
  if (exists) {
    // skip if that dir exists
    print.skip('@tables', `src/tables/${name}`)
    callback()
  }
  else {
    console.log(`create: ${base}`)
    mkdir(`src/tables/${name}`)

    // write package.json
    var pathToPkg = path.join(base, 'package.json')
    var pkg = {
      name: `${app}-${name}`
    }
    fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))

    // copy in index.js
    var index = path.join(__dirname, '..', '..', 'templates', 'table-lambda', `${mthd}.js`)
    cp(index, path.join(base, 'index.js'))

    // npm i latest deps in the hello world template
    exec(`
      cd ${base} && \
      npm i @architect/functions --save --production
    `,
    function _exec(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
}
