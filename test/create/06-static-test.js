var nukeLambdas = require('./_nuke-lambdas')
var nukeApis = require('./_nuke-apis')
var path = require('path')
var rm = require('rimraf').sync
var mkdir = require('mkdirp').sync
var cp = require('cp').sync
var test = require('tape')
var run = require('../../src/create')
var aws = require('aws-sdk')
var s3 = new aws.S3
var parallel = require('run-parallel')

test('env', t=> {
  t.plan(1)
  t.ok(run, 'run exists')
})

test('setup', t=> {
  t.plan(1)
  mkdir('test/create/_mock')
  cp('test/create/06-static-mock.arc', 'test/create/_mock/.arc')
  process.chdir('test/create/_mock')
  t.ok(true, 'created test/create/_mock/.arc')
  console.log(process.cwd())
})

/*
test('cleanup', t=> {
  t.plan(1)
  parallel([
    'arc-testapp-staging', 
    'arc-testapp-production'
  ].map(b=> {
    return function _del(callback) {
      s3.deleteBucket({
        Bucket: b
      }, callback)
    }
  }), 
  function _done(err) {
    if (err) throw err
    t.ok(true, 'clobbered s3')
  })
})*/

test('plan', t=> {
  t.plan(1)
  run({
    arcFile: path.join(process.cwd(), '.arc'),
    execute: false
  },
  function _ran(err, plans) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(plans, 'got plans')
      console.log(JSON.stringify(plans, null, 2))
    }
  })
})

test('exec', t=> {
  t.plan(1)
  run({
    arcFile: path.join(process.cwd(), '.arc'),
    execute: true
  },
  function _ran(err) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'got plans')
    }
  })
})
