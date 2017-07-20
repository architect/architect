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
    /**
     *  !important
     *
     *  tests following this test will execute in test/mock
     */
  process.chdir('test/mock')
  t.ok(process.cwd(), process.cwd())
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
      console.log(data)    
    }
  })
})

test('teardown', t=> {
  t.plan(1)
  server.close()
  client.close()
  t.ok(true, 'server closed')
})
