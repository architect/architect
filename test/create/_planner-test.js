var test = require('tape')

var planner = require('../../src/create/_planner')
var base = {
  app: ['mah-app']
}

test('create planner returns default plans', t=> {
  var arc = Object.assign({}, base)
  t.plan(4)
  var plans = planner(arc)
  t.deepEqual(plans.filter(x => x.action === 'create-iam-role')[0], {action:'create-iam-role', app: base.app[0]},  'contains create iam role')
  t.deepEqual(plans.filter(x => x.action === 'create-shared')[0], {action:'create-shared', app: base.app[0]},  'contains create shared')
  t.deepEqual(plans.filter(x => x.action === 'create-public')[0], {action:'create-public', app: base.app[0]},  'contains create public')
  t.deepEqual(plans.filter(x => x.action === 'create-views')[0], {action:'create-views', app: base.app[0]},  'contains create views')
  t.end()
})
test('create planner returns sns event plans', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  t.plan(7)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong'},  'contains create lambda code with second of two events')
  var createeventplans = plans.filter(x => x.action === 'create-events')
  t.deepEqual(createeventplans[0], {action:'create-events', app: base.app[0], event:'bing'},  'contains create events with first of two events')
  t.deepEqual(createeventplans[1], {action:'create-events', app: base.app[0], event:'bong'},  'contains create events with second of two events')
  var createdeployplans = plans.filter(x => x.action === 'create-event-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-event-lambda-deployments', app: base.app[0], event:'bing'},  'contains event lambda deployments with first of two events')
  t.deepEqual(createdeployplans[1], {action:'create-event-lambda-deployments', app: base.app[0], event:'bong'},  'contains event lambda deployments with second of two events')
  t.equal(plans.length, 10, 'create 3 plans for each event in this scenario') // 6 for the events and 4 from the default plans
  t.end()
})
test('create planner returns subset of sns event plans when arc local env var is set', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.comment(process.env.ARC_LOCAL)
  t.plan(3)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong'},  'contains create lambda code with second of two events')
  t.equal(plans.length, 6, 'only create-event-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns queue plans', t=> {
  t.end()
})
test('create planner returns scheduled plans', t=> {
  t.end()
})
test('create planner returns static (s3 bucket) plans', t=> {
  t.end()
})
test('create planner returns http lambda plans', t=> {
  t.end()
})
test('create planner returns session table creation plans if arc file contains http or slack', t=> {
  t.end()
})
test('create planner ignores session table creation plans if disable session env var is set', t=> {
  t.end()
})
test('create planner ignores session table creation plans if arc local env var is set', t=> {
  t.end()
})
test('create planner returns table plans', t=> {
  t.end()
})
test('create planner returns index plans', t=> {
  t.end()
})
test('create planner ignores index plans if arc local env var is set', t=> {
  t.end()
})
test('create planner returns api gateway creation plans if arc file contains http or slack', t=> {
  t.end()
})
