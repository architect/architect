var assert = require('@smallwins/validate/assert')
var path = require('path')
var mkdir = require('mkdirp').sync
var exec = require('child_process').exec
var fs = require('fs')
var cp = fs.copyFileSync
var print = require('../_print')
var exists = require('path-exists').sync

function _setBase(localPath, callback){
  exec(`
    cd ${localPath} && \
    npm i @architect/functions @architect/data --save --production
  `,
  function _exec(err) {
    if (err) {
      console.log(err)
    }
    var pathToLocalArcCopy = path.join(localPath, 'node_modules', '@architect', 'shared')
    mkdir(pathToLocalArcCopy)
    cp(path.join(process.cwd(), '.arc'), path.join(pathToLocalArcCopy, '.arc'))
    callback()
  })
}

module.exports = function _createCode(params, callback) {

  assert(params, {
    idx: String,
    space: String, // scheduled, events, html, json, table
    app: String,
  })

  // non destructive setup dir
  mkdir('src')
  mkdir(`src/${params.space}`)

  var localPath = path.join(process.cwd(), 'src', params.space, params.idx)

  if (exists(localPath)) {
    print.skip(`@${params.space} code`, `src/${params.space}/${params.idx}`)
    _setBase(localPath, callback)
  }
  else {
    print.create(`@${params.space} code`, `src/${params.space}/${params.idx}`)

    var lambda = `src/${params.space}/${params.idx}`
    var pathToPkg = path.join(localPath, 'package.json')
    var filename = params.space === 'html' || params.space === 'json'? `${params.idx.split('-')[0]}.js` : 'index.js'
    var index = path.join(__dirname, '..', 'templates', `${params.space}-lambda`, filename)
    var pkg = JSON.stringify({name:`${params.app}-${params.idx}`}, null, 2)

    mkdir(lambda)
    fs.writeFileSync(pathToPkg, pkg)
    cp(index, path.join(localPath, 'index.js'))
    _setBase(localPath, callback)
  }
}
