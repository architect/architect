const fs = require('fs')
const rm = require('rimraf').sync
const cp = fs.copyFileSync
const path = require('path')
const mkdir = require('mkdirp').sync
const test = require('tape')
const db = require('../../src/sandbox').db
const sandbox = require('../../src/sandbox').http
var client
var server
var port = process.env.PORT || '3335'

test('setup', t => {
  mkdir('test/sandbox/_mock')

  cp('test/sandbox/04-views-mock.arc', 'test/sandbox/_mock/.arc')

  mkdir('test/sandbox/_mock/src')
  mkdir('test/sandbox/_mock/src/views')
  mkdir('test/sandbox/_mock/src/http')
  mkdir('test/sandbox/_mock/src/http/get-js-000module')
  mkdir('test/sandbox/_mock/src/http/get-index')
  mkdir('test/sandbox/_mock/src/http/post-index')

  fs.writeFileSync('test/sandbox/_mock/src/views/holla.js', 'module.exports = function () {console.log(`HOLLA`)}')
  fs.writeFileSync('test/sandbox/_mock/src/http/get-index/index.js', 'module.exports = function () {}')
  fs.writeFileSync('test/sandbox/_mock/src/http/post-index/index.js', 'module.exports = function () {}')
  fs.writeFileSync('test/sandbox/_mock/src/http/get-js-000module/index.js', 'module.exports = function () {}')

  process.chdir('test/sandbox/_mock')

  t.ok(true, 'created test/_mock/.arc')
  t.end()
})

test('setup db server', t => {
  client = db.start(function startDB () {
    t.ok(true, 'started db @ localhost:5000')
    t.end()
  })
})

test('setup web server', t => {
  server = sandbox.start(function startSandbox () {
    t.ok(true, `started server @ localhost:${port}`)
    t.end()
  })
})

test('should copy views', t => {
  let exists = fs.existsSync(path.join(__dirname, '_mock', 'src', 'http', 'get-js-000module', 'node_modules', '@architect', 'views', 'holla.js'))
  t.ok(exists, 'src/http/get-js-000module/node_modules/@architect/views/holla.js Exists!')
  t.end()
})

test('teardown', t => {
  server.close()
  client.close()
  rm(path.join(__dirname, '_mock'))
  t.ok(true, 'server closed')
  t.end()
})
