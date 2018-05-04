var nukeLambdas = require('./_nuke-lambdas')
var nukeApis = require('./_nuke-apis')
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

/*
test('cleanup lambdas', t=> {
  t.plan(2)
  rm('test/create/_mock')
  t.ok(true, 'deleted test/create/_mock')
  nukeLambdas([
    'testapp-production-slack-testbot-actions',
    'testapp-production-slack-testbot-events',
    'testapp-production-slack-testbot-slash',
    'testapp-production-slack-testbot-options',
    'testapp-staging-slack-testbot-actions',
    'testapp-staging-slack-testbot-events',
    'testapp-staging-slack-testbot-slash',
    'testapp-staging-slack-testbot-options',
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

test('cleanup apis', t=> {
  t.plan(1)
  nukeApis([
    'testapp-staging',
    'testapp-production',
  ],
  function _nuke(err) {
    if (err) {
      console.log(err)
    }
    t.ok(true, 'lambdas nuked')
  })
})
*/
test('setup', t=> {
  t.plan(1)
  mkdir('test/create/_mock')
  cp('test/create/05-slack-mock.arc', 'test/create/_mock/.arc')
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
