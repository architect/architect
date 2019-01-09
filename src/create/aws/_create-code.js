let assert = require('@smallwins/validate/assert')
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let print = require('../_print')
let exists = require('path-exists').sync
let install = require('./_install-workflows-and-data')

// this is annoying; but makes packing into an executable far easier
let eventsLambda = `let arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.events.subscribe(handler)
`
let httpLambda = `// @architect/functions enables secure sessions, express-style middleware and more
// let arc = require('@architect/functions')
// let url = arc.http.helpers.url

exports.handler = async function http(req) {
  console.log(req)
  return {
    type: 'text/html; charset=utf8',
    body: '<h1>Hello world!</h1>'
  }
}

// Example responses

/* Forward requester to a new path
exports.handler = async function http(request) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(request)
  }
  return {
    status: 302,
    location: '/staging/about',
  }
}
*/

/* Successful resource creation, CORS enabled
exports.handler = async function http(request) {
  return {
    status: 201,
    type: 'application/json',
    body: JSON.stringify({ok: true}),
    cors: true,
  }
}
*/

/* Deliver client-side JS
exports.handler = async function http(request) {
  return {
    type: 'text/javascript',
    body: 'console.log("Hello world!")',
  }
}
*/

// Learn more: https://arc.codes/guides/http
`
let queuesLambda = `let arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.queues.subscribe(handler)
`
let scheduledLambda = `let arc = require('@architect/functions')

function handler(event, callback) {
  console.log(JSON.stringify(event, null, 2))
  callback()
}

exports.handler = arc.scheduled(handler)
`
let insertLambda = `let arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.tables.insert(handler)
`
let updateLambda = `let arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.tables.update(handler)
`
let deleteLambda = `let arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.tables.destroy(handler)
`
let wsLambda = `exports.handler = async function ws(event) {
  console.log(JSON.stringify(event, null, 2))
  return {statusCode: 200}
}
`

let codes = {
  http: httpLambda,
  events: eventsLambda,
  scheduled: scheduledLambda,
  queues: queuesLambda,
  insert: insertLambda,
  update: updateLambda,
  delete: deleteLambda,
  ws: wsLambda,
}

module.exports = function _createCode(params, callback) {

  assert(params, {
    idx: String,
    space: String, // http, scheduled, events, queues, tables
    app: String,
  })

  // non destructive setup dir
  mkdir('src')
  mkdir(`src/${params.space}`)

  let localPath = path.join(process.cwd(), 'src', params.space, params.idx)

  if (exists(localPath)) {
    print.skip(`@${params.space} code`, `src/${params.space}/${params.idx}`)
    callback()
  }
  else {
    print.create(`@${params.space} code`, `src/${params.space}/${params.idx}`)

    let lambda = `src/${params.space}/${params.idx}`
    let pathToPkg = path.join(localPath, 'package.json')
    let pathToIndex = path.join(localPath, 'index.js')
    let pkg = JSON.stringify({name:`${params.app}-${params.idx}`}, null, 2)
    let index = codes[params.space === 'tables'? getType(params.idx) : params.space]

    // make sure the dir exists
    mkdir(lambda)

    // write in the files
    fs.writeFileSync(pathToPkg, pkg)
    fs.writeFileSync(pathToIndex, index)
  }

  install(localPath, callback)
}

function getType(idx) {
  if (idx.includes('insert'))
    return 'insert'
  if (idx.includes('update'))
    return 'update'
  else
    return 'delete'
}
