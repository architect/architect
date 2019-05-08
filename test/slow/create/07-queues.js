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
 * test/_mock/.arc
 */
test('@queues setup', t=> {
  t.plan(1)
  mkdir('test/_mock')
  cp('test/slow/create/07-queues-mock.arc', 'test/_mock/.arc')
  process.chdir('test/_mock')
  t.ok(true, 'created test/_mock/.arc')
  console.log(process.cwd())
})

/**
 * runs create on test/create/_mock/.arc
 */
test('@queues verify lambdas', t=> {
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
      lambda.listFunctions({}, function done(err, result) {
        if (err) t.fail(err)
        else {
          let res = result.Functions.map(f=> f.FunctionName)
          t.ok(res.some(n=> n === 'testapp-production-test-queue'), 'testapp-production-test-queue')
          t.ok(res.some(n=> n === 'testapp-staging-test-queue'), 'testapp-staging-test-queue')
          t.ok(res.some(n=> n === 'testapp-production-test-queue-two'), 'testapp-production-test-queue-two')
          t.ok(res.some(n=> n === 'testapp-staging-test-queue-two'), 'testapp-staging-test-queue-two')
        }
      })
    }
  })
})

test('@queues inventory/nuke', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      nuke(result, function(err, result) {
        t.ok(true, 'nuked')
      })
    }
  })
})
