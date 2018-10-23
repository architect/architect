const fs = require('fs')
const rm = require('rimraf').sync
const cp = fs.copyFileSync
const path = require('path')
const mkdir = require('mkdirp')
const test = require('tape')
const db = require('../../src/sandbox').db
const sandbox = require('../../src/sandbox').http
var client
var server
var port = process.env.PORT || '3335'

test('setup', t => {
  t.plan(1)

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
  console.log(process.cwd())
})

test('setup db server', t => {
  t.plan(1)
  client = db.start(function startDB () {
    t.ok(true, 'started db @ localhost:5000')
  })
})

test('setup web server', t => {
  t.plan(1)
  server = sandbox.start(function startSandbox () {
    t.ok(true, `started server @ localhost:${port}`)
  })
})

test('should copy views', t => {
  t.plan(1)
  t.ok(fs.existsSync(path.join(__dirname, '_mock', 'src', 'http', 'get-index', 'node_modules', '@architect', 'views')))
})

test('teardown', t => {
  t.plan(1)
  // rm(path.join(__dirname, '_mock'))
  server.close()
  client.close()
  t.ok(true, 'server closed')
})
