var parse = require('@architect/parser')
var fs = require('fs')
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

test('deploy.lambda', t=> {
  t.plan(1)
  var noop = x=> !x
  var arc = parse(fs.readFileSync(path.join(process.cwd(), '.arc')).toString())
  deploy.lambda({
    env: 'staging',
    arc,
    pathToCode: path.join('src', 'html', 'get-index'),
    tick: noop,
    start: Date.now(),
  },
  function _ran(err, result) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'deployed')
      console.log(result)
    }
  })
})

test('deploy.static', t=> {
  t.plan(1)
  var noop = x=> !x
  var arc = parse(fs.readFileSync(path.join(process.cwd(), '.arc')).toString())
  deploy.static({
    env: 'staging',
    arc,
    pathToCode: path.join('src', 'html', 'get-index'),
    tick: noop,
    start: Date.now(),
  },
  function _ran(err, result) {
    if (err) {
      t.fail(err)
      console.log(err, result)
    }
    else {
      t.ok(true, 'deployed')
      console.log(result)
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

test('return home', t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, '..', '..', '..'))
  t.ok(true, 'returned back to cwd')
})
*/
