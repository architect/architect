var test = require('tape')

var planner = require('../../src/create/_planner')
var base = {
  app: ['mah-app']
}

test('create planner returns default plans', t=> {
  var arc = Object.assign({}, base)
  t.plan(3)
  var plans = planner(arc)
 // t.deepEqual(plans.filter(x => x.action === 'create-iam-role')[0], {action:'create-iam-role', app: base.app[0]},  'contains create iam role')
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
  t.deepEqual(createeventplans[0], {action:'create-events', app: base.app[0], event:'bing'}, 'contains create events with first of two events')
  t.deepEqual(createeventplans[1], {action:'create-events', app: base.app[0], event:'bong'}, 'contains create events with second of two events')
  var createdeployplans = plans.filter(x => x.action === 'create-event-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-event-lambda-deployments', app: base.app[0], event:'bing'}, 'contains event lambda deployments with first of two events')
  t.deepEqual(createdeployplans[1], {action:'create-event-lambda-deployments', app: base.app[0], event:'bong'}, 'contains event lambda deployments with second of two events')
  t.equal(plans.length, 10, 'create 3 plans for each event in this scenario') // 6 for the events and 4 from the default plans
  t.end()
})
test('create planner returns subset of sns event plans if local', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(3)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong'},  'contains create lambda code with second of two events')
  t.equal(plans.length, 5, 'only create-event-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns queue plans', t=> {
  var arc = Object.assign({
    queues: ['bing', 'bong']
  }, base)
  t.plan(7)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-queue-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-queue-lambda-code', app: base.app[0], queue:'bing'},  'contains create lambda code with first of two queues')
  t.deepEqual(lambdacodeplans[1], {action:'create-queue-lambda-code', app: base.app[0], queue:'bong'},  'contains create lambda code with second of two queues')
  var createqueueplans = plans.filter(x => x.action === 'create-queue')
  t.deepEqual(createqueueplans[0], {action:'create-queue', app: base.app[0], queue:'bing'},  'contains create queues with first of two queues')
  t.deepEqual(createqueueplans[1], {action:'create-queue', app: base.app[0], queue:'bong'},  'contains create queues with second of two queues')
  var createdeployplans = plans.filter(x => x.action === 'create-queue-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-queue-lambda-deployments', app: base.app[0], queue:'bing'}, 'contains queue lambda deployments with first of two queues')
  t.deepEqual(createdeployplans[1], {action:'create-queue-lambda-deployments', app: base.app[0], queue:'bong'}, 'contains queue lambda deployments with second of two queues')
  t.equal(plans.length, 10, 'create 3 plans for each queue in this scenario') // 6 for the queues and 4 from the default plans
  t.end()
})
test('create planner returns subset of queue plans if local', t=> {
  var arc = Object.assign({
    queues: ['bing', 'bong']
  }, base)
  t.plan(4)
  process.env.ARC_LOCAL = 'true'
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-queue-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-queue-lambda-code', app: base.app[0], queue:'bing'},  'contains create lambda code with first of two queues')
  t.deepEqual(lambdacodeplans[1], {action:'create-queue-lambda-code', app: base.app[0], queue:'bong'},  'contains create lambda code with second of two queues')
  var createqueueplans = plans.filter(x => x.action === 'create-queue')
  t.equal(createqueueplans.length, 0, 'no create queue plans')
  var createdeployplans = plans.filter(x => x.action === 'create-queue-lambda-deployments')
  t.equal(createdeployplans.length, 0, 'no create queue deploy plans')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns scheduled plans', t=> {
  var arc = Object.assign({
    scheduled: ['bing', 'bong']
  }, base)
  t.plan(5)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-scheduled-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing'},  'contains create lambda code with first of two schedules')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong'},  'contains create lambda code with second of two schedules')
  var lambdadeployplans = plans.filter(x => x.action === 'create-scheduled-lambda-deployments')
  t.deepEqual(lambdadeployplans[0], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bing'},  'contains create lambda deployment with first of two schedules')
  t.deepEqual(lambdadeployplans[1], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bong'},  'contains create lambda deployment with second of two schedules')
  t.equal(plans.length, 8, 'only create-scheduled-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  t.end()
})
test('create planner does not return scheduled lambda deployment plans if local', t=> {
  var arc = Object.assign({
    scheduled: ['bing', 'bong']
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(4)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-scheduled-lambda-code')
  t.equal(plans.filter(x => x.action === 'create-scheduled-lambda-deployments').length, 0, 'no create-scheduled-lambda-deployment events exist')
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong'},  'contains create lambda code with second of two events')
  t.equal(plans.length, 5, 'only create-event-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns static (s3 bucket) plans', t=> {
  var arc = Object.assign({
    static: [['staging', 'qa'], ['production', 'prod']]
  }, base)
  t.plan(2)
  var plans = planner(arc)
  var createstaticplans = plans.filter(x => x.action === 'create-static-deployments')
  t.equal(createstaticplans.length, 1, 'a create static deployment exists')
  t.deepEqual(createstaticplans[0], {action:'create-static-deployments', static:arc.static}, 'contains create static deployment with proper stage and prod names')
  t.end()
})
test('create planner returns no static (s3 bucket) plans when local', t=> {
  var arc = Object.assign({
    static: [['staging', 'qa'], ['production', 'prod']]
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(1)
  var plans = planner(arc)
  var createstaticplans = plans.filter(x => x.action === 'create-static-deployments')
  t.equal(createstaticplans.length, 0, 'no create static deployment exist')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns http lambda code plans', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  t.plan(5)
  var plans = planner(arc)
  var createcodeplans = plans.filter(x => x.action === 'create-http-lambda-code')
  t.deepEqual(createcodeplans[0], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[0]},  'contains create lambda code with first of two routes')
  t.deepEqual(createcodeplans[1], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[1]},  'contains create lambda code with second of two routes')
  var createdeployplans = plans.filter(x => x.action === 'create-http-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[0]},  'contains create lambda deployment with first of two routes')
  t.deepEqual(createdeployplans[1], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[1]},  'contains create lambda deployment with second of two routes')
  t.equal(plans.length, 12, 'create-lambda code and deployment events exist') // 2 lambda code and 2 lambda deploy exist (one for each route), 4 default plans, 1 for routers, 2 http routes (one for each route) plus 1 router deployments
  t.end()
})
test('create planner does not return http lambda deployment plans if local', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(3)
  var plans = planner(arc)
  var createdeployplans = plans.filter(x => x.action === 'create-http-lambda-deployments')
  var createcodeplans = plans.filter(x => x.action === 'create-http-lambda-code')
  t.equal(createdeployplans.length, 0, 'no http lambda code deployment events exist')
  t.equal(createcodeplans.length, 2, 'two http lambda code creation events exist')
  t.equal(plans.length, 5, 'create-lambda code and deployment events exist') // 2 lambda code (one for each route) and 4 default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns http route creation plans if not local', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  t.plan(4)
  var plans = planner(arc)
  var createroutersplan = plans.filter(x => x.action === 'create-routers')
  t.deepEqual(createroutersplan[0], {action:'create-routers', app: base.app[0]}, 'contains create routers plan')
  var createhttprouteplans = plans.filter(x => x.action === 'create-http-route')
  t.deepEqual(createhttprouteplans[0], {action:'create-http-route', app: base.app[0], route:arc.http[0]},  'contains create http route with first of two routes')
  t.deepEqual(createhttprouteplans[1], {action:'create-http-route', app: base.app[0], route:arc.http[1]},  'contains create http route with second of two routes')
  var createrouterdeployplan = plans.filter(x => x.action === 'create-router-deployments')
  t.deepEqual(createrouterdeployplan[0], {action:'create-router-deployments', app: base.app[0]},  'contains create router deployments plan')
  t.end()
})
test('create planner creates table plans if not local', t=> {
  var arc = Object.assign({
    tables: [{posts:{postID:"*String",posted:"**String",ttl:"TTL"}}, {ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}]
  }, base)
  t.plan(2)
  var plans = planner(arc)
  var createtablesplans = plans.filter(x => x.action === 'create-tables')
  t.deepEqual(createtablesplans[0], {action:'create-tables', table:{posts:{postID:"*String",posted:"**String",ttl:"TTL"}}, app: base.app[0]}, 'contains create tables plan for first table')
  t.deepEqual(createtablesplans[1], {action:'create-tables', table:{ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}, app: base.app[0]}, 'contains create tables plan for second table')
  t.end()
})
test('create planner includes create table lambda code plans', t=> {
  var arc = Object.assign({
    tables: [{posts:{postID:"*String",posted:"**String",ttl:"TTL"}}, {ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}]
  }, base)
  t.plan(4)
  var plans = planner(arc)
  var createtablelambdaplans = plans.filter(x => x.action === 'create-table-lambda-code')
  t.equal(createtablelambdaplans.length, 1, 'only one create table lambda code plan exists for one of the two tables')
  t.deepEqual(createtablelambdaplans[0], {action:'create-table-lambda-code', table:{ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}, app: base.app[0]}, 'contains create table lambda for second table only')
  var createtablelambdadeploys = plans.filter(x => x.action === 'create-table-lambda-deployments')
  t.equal(createtablelambdadeploys.length, 1, 'only one create table lambda deployment exists for one of the two tables')
  t.deepEqual(createtablelambdadeploys[0], {action:'create-table-lambda-deployments', table:{ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}, app: base.app[0]}, 'contains create table lambda for second table only')
  t.end()
})
test('create planner excludes create table lambda deployment plans if local', t=> {
  var arc = Object.assign({
    tables: [{posts:{postID:"*String",posted:"**String",ttl:"TTL"}}, {ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}]
  }, base)
  t.plan(1)
  process.env.ARC_LOCAL = 'true'
  var plans = planner(arc)
  var createtablelambdaplans = plans.filter(x => x.action === 'create-table-lambda-deployments')
  t.equal(createtablelambdaplans.length, 0, 'no create table lambda deployment exists')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns index plans', t=> {
  var arc = Object.assign({
    indexes: [{ppl:{personID:"*String"}}]
  }, base)
  t.plan(2)
  var plans = planner(arc)
  var createtableindexplans = plans.filter(x => x.action === 'create-table-index')
  t.equal(createtableindexplans.length, 1, 'a create table index exists')
  t.deepEqual(createtableindexplans[0], {action:'create-table-index', index:{ppl:{personID:"*String"}}, app: base.app[0]}, 'contains create table index')
  t.end()
})
test('create planner returns no index plans if local', t=> {
  var arc = Object.assign({
    indexes: [{ppl:{personID:"*String"}}]
  }, base)
  t.plan(1)
  process.env.ARC_LOCAL = 'true'
  var plans = planner(arc)
  var createtableindexplans = plans.filter(x => x.action === 'create-table-index')
  t.equal(createtableindexplans.length, 0, 'no create table index plans exist')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns router deployment plans if arc file contains slack pragma', t=> {
  t.end()
})
