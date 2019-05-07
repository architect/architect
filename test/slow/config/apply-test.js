let aws = require('aws-sdk')
let test = require('tape')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let cp = require('fs').copyFileSync
let rm = require('rimraf').sync
let mkdir = require('mkdirp').sync

let create = require('../../../src/create')
let inventory = require('../../../src/inventory')
let report = require('../../../src/config/report')
let apply = require('../../../src/config/apply')
let nuke = require('../../../src/inventory/nuke')

/**
 * test/create/_mock/.arc
 */
test('npx config test setup', t=> {
  t.plan(1)
  mkdir('test/config/_mock')
  cp('test/slow/config/mock.arc', 'test/config/_mock/.arc')
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
 * copy in .arc-config files
 * - one unmodified
 * - one http fn with everythign changed
 * - one sqs with visability
 * - one scheduled with state
 */
test('copy .arc-config', t=> {
  t.plan(1)
  cp('../../slow/config/mock-scheduled.arc',
     'src/scheduled/sched/.arc-config')
  cp('../../slow/config/mock-http.arc', 
     'src/http/get-index/.arc-config')
  cp('../../slow/config/mock-queues.arc', 
     'src/queues/aq/.arc-config')
  t.ok(true, 'copied test configuration files')
})

/**
 * npx config 
 */
test('npx config', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  report(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'ran without error')
      console.log(result)
    }
  })
})

/**
 * npx config apply
 */
test('npx config apply', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  apply(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'ran without error')
      console.log(result)
    }
  })
})

test('verify http .arc-config settings', t=> {
  t.plan(3)
  let lambda = new aws.Lambda
  lambda.getFunction({
    FunctionName: 'testapp-production-get-index',
  },
  function done(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(result.Configuration.MemorySize === 128, 'memory eq 128')
      t.ok(result.Configuration.Timeout === 10, 'timeout eq 10')
      t.ok(result.Concurrency.ReservedConcurrentExecutions === 1, 'concurrency eq 1')
    }
  })
})

test('verify scheduled .arc-config settings', t=> {
  t.plan(1)
  let cloudwatch = new aws.CloudWatchEvents
  cloudwatch.describeRule({
    Name: 'testapp-production-sched',
  }, 
  function done(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(result.State === 'DISABLED', 'is disabled')
    }
  })
})

test('verify queues .arc-config settings', t=> {
  t.plan(1)
  let sqs = new aws.SQS
  waterfall([
    function getQueueUrl(callback) {
      sqs.getQueueUrl({
        QueueName: 'testapp-production-aq'
      }, callback)
    },
    function getQueueAttr({QueueUrl}, callback) {
      sqs.getQueueAttributes({
        QueueUrl,
        AttributeNames: ['VisibilityTimeout']
      }, callback)
    }
  ],
  function done(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(result.Attributes.VisibilityTimeout === '5', 'set to 5')
      console.log(result)
    }
  })
})


/**
 * cleanup (and test inventory/nuke!)
 */
test('inventory/nuke', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function done(err, result) {
    if (err) t.fail(err)
    else {
      nuke(result, function(err, result) {
        t.ok(true, 'cleaned up')
      })
    }
  })
})
