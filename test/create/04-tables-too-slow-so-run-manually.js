var nukeLambdas = require('./_nuke-lambdas')
var nukeTables = require('./_nuke-tables')
var path = require('path')
var rm = require('rimraf').sync
var mkdir = require('mkdirp').sync
var cp = require('cp').sync
var test = require('tape')
var run = require('../../src/create')

test('env', t=> {
  t.plan(1)
  t.ok(run, 'run exists')
})

test('setup', t=> {
  t.plan(1)
  mkdir('test/create/_mock')
  cp('test/create/04-tables-mock.arc', 'test/create/_mock/.arc')
  process.chdir('test/create/_mock')
  t.ok(true, 'created test/create/_mock/.arc')
  console.log(process.cwd())
})

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
    }
    else {
      t.ok(true, 'got plans')
    }
  })
})

test('cleanup lambdas', t=> {
  t.plan(1)
  rm('test/_mock')
  nukeLambdas([
    'testapp-staging-ppl-insert',
    'testapp-staging-ppl-update',
    'testapp-staging-ppl-delete',
    'testapp-production-ppl-insert',
    'testapp-production-ppl-update',
    'testapp-production-ppl-delete',
  ],
  function _nuke(err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'lambdas nuked')
    }
  })
})

test('cleanup dynamo tables', t=> {
  t.plan(1)
  nukeTables([
    'testapp-staging-ppl',
    'testapp-production-ppl',
    'testapp-staging-posts',
    'testapp-production-posts',
  ],
  function _nuke(err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'lambdas nuked')
    }
  })
})
