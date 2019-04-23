let aws = require('aws-sdk')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let rm = require('rimraf').sync
let mkdir = require('mkdirp').sync
let cp = require('fs').copyFileSync
let test = require('tape')
let create = require('../../../src/create')
let inventory = require('../../../src/inventory')
let nuke = require('../../../src/inventory/nuke')

/**
 * test/create/_mock/.arc
 */
test('npx config test setup', t=> {
  t.plan(1)
  mkdir('test/config/_mock')
  cp('test/_slow_integration_tests/config/mock.arc', 'test/config/_mock/.arc')
  process.chdir('test/config/_mock')
  t.ok(true, 'created test/config/_mock/.arc')
  console.log(process.cwd())
})

/**
 * runs create on test/create/_mock/.arc
 */
test('create lambdas', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  create(arc, raw, function _ran(err, plans) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'created')
    }
  })
})

/**
 * test inventory
 */
test('inventory', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(result.lambdas.length === 8, '8 lambdas generated')
      console.log(result)
    }
  })
})

/**
 * test inventory/nuke
 */
test('inventory/nuke', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      nuke(result, function(err, result) {
        t.ok(true, 'got result')
        console.log(err, result)
      })
    }
  })
})

/*
test('@scheduled verify nuke', t=> {
  t.plan(8)
  parallel({
    lambdas(callback) {
      let lambda = new aws.Lambda
      lambda.listFunctions({}, function done(err, {Functions}) {
        if (err) callback(err)
        else callback(null, Functions.map(f=> f.FunctionName))
      })
    },
    rules(callback) {
      let cw = new aws.CloudWatchEvents
      cw.listRules({}, function done(err, {Rules}) {
        if (err) callback(err)
        else callback(null, Rules.map(r=> r.Name))
      }) 
    },
  },
  function done(err, {lambdas, rules}) {
    if (err) t.fail(err)
    else {
      t.ok(lambdas.includes('testapp-production-sched') === false, 'testapp-production-sched')
      t.ok(lambdas.includes('testapp-staging-sched') === false, 'testapp-staging-sched')
      t.ok(lambdas.includes('testapp-production-sched2') === false, 'testapp-production-sched2')
      t.ok(lambdas.includes('testapp-staging-sched2') === false, 'testapp-staging-sched2')
      t.ok(rules.includes('testapp-production-sched') === false, 'testapp-production-sched')
      t.ok(rules.includes('testapp-staging-sched') === false, 'testapp-staging-sched')
      t.ok(rules.includes('testapp-production-sched2') === false, 'testapp-production-sched2')
      t.ok(rules.includes('testapp-staging-sched2') === false, 'testapp-staging-sched2')
    }
  })
})*/
