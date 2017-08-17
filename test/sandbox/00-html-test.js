var tiny = require('tiny-json-http')
var cp = require('cp').sync
var join = require('path').join
var mkdir = require('mkdirp')
var test = require('tape')
var sandbox = require('../../src/sandbox').http
var db = require('../../src/sandbox').db
var client
var server

test('setup', t=> {
  t.plan(1)

  mkdir('test/sandbox/_mock')
  cp('test/sandbox/00-mock.arc', 'test/sandbox/_mock/.arc')

  mkdir('test/sandbox/_mock/src')
  mkdir('test/sandbox/_mock/src/json')
  mkdir('test/sandbox/_mock/src/html')
  mkdir('test/sandbox/_mock/src/json/get-api')
  mkdir('test/sandbox/_mock/src/html/get-index')

  cp('test/sandbox/00-get-index-mock.js', 'test/sandbox/_mock/src/html/get-index/index.js')
  cp('test/sandbox/00-get-api-mock.js', 'test/sandbox/_mock/src/json/get-api/index.js')

  process.chdir('test/sandbox/_mock')
  t.ok(true, 'created test/_mock/.arc')
  console.log(process.cwd())
})

test('setup db server', t=> {
  t.plan(1)
  client = db.start(function() {
    t.ok(true, 'started db @ localhost:5000')
  })
})

test('setup web server', t=> {
  t.plan(1)
  server = sandbox.start(function() {
    t.ok(true, 'started server @ localhost:3333')
  })
})

test('can read /', t=> {
  t.plan(2)
  tiny.get({
    url: 'http://localhost:3333/'
  }, 
  function _got(err, data) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'got /')
      t.equals('hello world', data.body, 'is hello world')
      console.log({data})    
    }
  })
})

test('can read /hello.css', t=> {
  t.plan(1)
    console.log(process.cwd())
  tiny.get({
    url: 'http://localhost:3333/hello.css'
  }, 
  function _got(err, data) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'got /hello.css')
      console.log({data})    
    }
  })
})

test('teardown', t=> {
  t.plan(1)
  server.close()
  client.close()
  t.ok(true, 'server closed')
})
