// create _mock
// copy in .arc
// run a create
// run a deploy
var path = require('path')
var rm = require('rimraf').sync
var mkdir = require('mkdirp').sync
var cp = require('cp').sync
var test = require('tape')

var create = require('../../src/create')
var deploy = require('../../src/deploy')

test('env', t=> {
  t.plan(2)
  t.ok(create, 'create exists')
  t.ok(deploy, 'deploy exists')
})

test('setup', t=> {
  t.plan(1)
  mkdir('test/deploy/_mock')
  cp('test/deploy/mock.arc', 'test/deploy/_mock/.arc')
  process.chdir('test/deploy/_mock')
  t.ok(true, 'created test/deploy/_mock/.arc')
  console.log(process.cwd())
})

test('plan', t=> {
  t.plan(1)
  create({
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
  create({
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

/*
test('cleanup lambdas', t=> {
  t.plan(1)
  process.chdir('../../')
  rm('test/_mock')
  nukeLambdas([
    'testapp-staging-test-event',
    'testapp-staging-test-event-two',
    'testapp-production-test-event',
    'testapp-production-test-event-two',
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

test('cleanup sns topics', t=> {
  t.plan(1)
  nukeTopics([
    'testapp-staging-test-event',
    'testapp-production-test-event',
    'testapp-staging-test-event-two',
    'testapp-production-test-event-two',
  ],
  function _nuke(err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'topics nuked')
    }
  })
})

test('return home', t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, '..', '..', '..'))
  t.ok(true, 'returned back to cwd')
})
*/
