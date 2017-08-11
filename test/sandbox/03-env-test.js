var tiny = require('tiny-json-http')
var join = require('path').join
var test = require('tape')
var sandbox = require('../../src/sandbox')
var end

test('setup', t=> {
  t.plan(1)
  server = sandbox.start(function(close) {
    end = close
    t.ok(true, 'started server @ localhost:3333')
  })
})

/*
test('can read /api', t=> {
  t.plan(5)
  tiny.get({
    url: 'http://localhost:3333/api'
  }, 
  function _got(err, data) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'got /')
      t.equals('world', data.body.hello, 'is hello world')
      t.equals('1', data.body.envs.GLOBAL_ONE, 'is hello world')
      t.equals('too', data.body.envs.GLOBAL_TWO, 'is hello world')
      t.equals('http://localhost:3333', data.body.envs.GLOBAL_THREE, 'is hello world')
      //console.log(data.body)    
    }
  })
})*/

test('teardown', t=> {
  t.plan(1)
  end()
  t.ok(true, 'server closed')
})

