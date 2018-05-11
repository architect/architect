let assert = require('@smallwins/validate/assert')
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let cp = fs.copyFileSync
let print = require('../_print')
let exists = require('path-exists').sync
let install = require('./_install-workflows-and-data')

module.exports = function _createCode(params, callback) {

  assert(params, {
    idx: String,
    space: String, // scheduled, events, html, json, table
    app: String,
  })

  // non destructive setup dir
  mkdir('src')
  mkdir(`src/${params.space}`)

  let localPath = path.join(process.cwd(), 'src', params.space, params.idx)

  if (exists(localPath)) {
    print.skip(`@${params.space} code`, `src/${params.space}/${params.idx}`)
  }
  else {
    print.create(`@${params.space} code`, `src/${params.space}/${params.idx}`)

    let lambda = `src/${params.space}/${params.idx}`
    let pathToPkg = path.join(localPath, 'package.json')
    let filename = params.space === 'html' || params.space === 'json'? `${params.idx.split('-')[0]}.js` : 'index.js'
    let index = path.join(__dirname, '..', 'templates', `${params.space}-lambda`, filename)
    let pkg = JSON.stringify({name:`${params.app}-${params.idx}`}, null, 2)

    mkdir(lambda)
    fs.writeFileSync(pathToPkg, pkg)
    cp(index, path.join(localPath, 'index.js'))
  }

  install(localPath, callback)

}
