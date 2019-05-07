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
test('@scheduled setup', t=> {
  t.plan(1)
  mkdir('test/create/_mock')
  cp('test/_slow_integration_tests/create/03-scheduled-mock.arc', 'test/create/_mock/.arc')
  process.chdir('test/create/_mock')
  t.ok(true, 'created test/create/_mock/.arc')
  console.log(process.cwd())
})

/**
 * runs create on test/create/_mock/.arc
 */
test('@scheduled verify lambdas', t=> {
  t.plan(4)

  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)

  create(arc, raw, function _ran(err, plans) {
    if (err) {
      t.fail(err)
    }
    else {
      let lambda = new aws.Lambda
      lambda.listFunctions({}, function(err, result) {
        if (err) {
          t.fail(err)
          console.log(err)
        }
        else {
          let res = result.Functions.map(f=> f.FunctionName)
          t.ok(res.some(n=> n === 'testapp-production-sched'), 'testapp-production-sched')
          t.ok(res.some(n=> n === 'testapp-staging-sched'), 'testapp-staging-sched')
          t.ok(res.some(n=> n === 'testapp-production-sched2'), 'testapp-production-sched2')
          t.ok(res.some(n=> n === 'testapp-staging-sched2'), 'testapp-staging-sched2')
        }
      })
    }
  })
})


/**
 * test rules got created
 */
test('@scheduled verify rules', t=> {
  t.plan(4)
  let cw = new aws.CloudWatchEvents
  cw.listRules({}, function(err, result) {
    if (err) t.fail(err)
    else {
      let res = result.Rules.map(f=> f.Name)
      t.ok(res.some(n=> n === 'testapp-production-sched'), 'testapp-production-sched')
      t.ok(res.some(n=> n === 'testapp-staging-sched'), 'testapp-staging-sched')
      t.ok(res.some(n=> n === 'testapp-production-sched2'), 'testapp-production-sched2')
      t.ok(res.some(n=> n === 'testapp-staging-sched2'), 'testapp-staging-sched2')
    }
  })
})

/**
 * test inventory
 */
test('@scheduled inventory', t=> {
  t.plan(4)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      let res = result.cwerules
      t.ok(res.some(n=> n === 'testapp-production-sched'), 'testapp-production-sched')
      t.ok(res.some(n=> n === 'testapp-staging-sched'), 'testapp-staging-sched')
      t.ok(res.some(n=> n === 'testapp-production-sched2'), 'testapp-production-sched2')
      t.ok(res.some(n=> n === 'testapp-staging-sched2'), 'testapp-staging-sched2')
    }
  })
})

/**
 * test inventory/nuke
 */
test('@scheduled inventory/nuke', t=> {
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
})
