var test = require('tape')

var planner = require('../../src/create/_planner')
var base = {
  app: ['mah-app']
}

test('create planner returns sns event plans', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  t.plan(7)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing', arc: { events: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong', arc: { events: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two events')
  var createeventplans = plans.filter(x => x.action === 'create-events')
  t.deepEqual(createeventplans[0], {action:'create-events', app: base.app[0], event:'bing'}, 'contains create events with first of two events')
  t.deepEqual(createeventplans[1], {action:'create-events', app: base.app[0], event:'bong'}, 'contains create events with second of two events')
  var createdeployplans = plans.filter(x => x.action === 'create-event-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-event-lambda-deployments', app: base.app[0], event:'bing'}, 'contains event lambda deployments with first of two events')
  t.deepEqual(createdeployplans[1], {action:'create-event-lambda-deployments', app: base.app[0], event:'bong'}, 'contains event lambda deployments with second of two events')
  t.equal(plans.length, 8 , '8 plans exist = 6 plans for the sns events (3 for each sns event) + 1 default plan (create-http-router) and 1 for report')
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
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing', arc: { events: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong', arc: { events: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two events')
  t.equal(plans.length, 3, '3 plans in local scenario')
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
  t.deepEqual(lambdacodeplans[0], {action:'create-queue-lambda-code', app: base.app[0], queue:'bing', arc: { queues: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two queues')
  t.deepEqual(lambdacodeplans[1], {action:'create-queue-lambda-code', app: base.app[0], queue:'bong', arc: { queues: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two queues')
  var createqueueplans = plans.filter(x => x.action === 'create-queue')
  t.deepEqual(createqueueplans[0], {action:'create-queue', app: base.app[0], queue:'bing'},  'contains create queues with first of two queues')
  t.deepEqual(createqueueplans[1], {action:'create-queue', app: base.app[0], queue:'bong'},  'contains create queues with second of two queues')
  var createdeployplans = plans.filter(x => x.action === 'create-queue-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-queue-lambda-deployments', app: base.app[0], queue:'bing'}, 'contains queue lambda deployments with first of two queues')
  t.deepEqual(createdeployplans[1], {action:'create-queue-lambda-deployments', app: base.app[0], queue:'bong'}, 'contains queue lambda deployments with second of two queues')
  t.equal(plans.length, 8, '8 plans exist = 6 plans to create 3 plans for each queue + 1 create router default plan + 1 for report')
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
  t.deepEqual(lambdacodeplans[0], {action:'create-queue-lambda-code', app: base.app[0], queue:'bing', arc: { queues: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two queues')
  t.deepEqual(lambdacodeplans[1], {action:'create-queue-lambda-code', app: base.app[0], queue:'bong', arc: { queues: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two queues')
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
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing', arc: { scheduled: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two schedules')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong', arc: { scheduled: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two schedules')
  var lambdadeployplans = plans.filter(x => x.action === 'create-scheduled-lambda-deployments')
  t.deepEqual(lambdadeployplans[0], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bing'},  'contains create lambda deployment with first of two schedules')
  t.deepEqual(lambdadeployplans[1], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bong'},  'contains create lambda deployment with second of two schedules')
  t.equal(plans.length, 6, '6 plans exist = 4 scheduled plan events, 2 create-scheduled-lambda-code events per event + 1 default create-router plan + 1 reporter')
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
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing', arc: { scheduled: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong', arc: { scheduled: [ 'bing', 'bong' ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two events')
  t.equal(plans.length, 3, '3 plans exist')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns static (s3 bucket) plans', t=> {
  var arc = Object.assign({
    static: [['staging', 'qa'], ['production', 'prod']]
  }, base)
  t.plan(2)
  var plans = planner(arc)
  var createstaticplans = plans.filter(x => x.action === 'create-http-static-deployments')
  t.equal(createstaticplans.length, 1, 'a create static deployment exists')
  t.deepEqual(createstaticplans[0], {action:'create-http-static-deployments', static:arc.static}, 'contains create static deployment with proper stage and prod names')
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
  t.deepEqual(createcodeplans[0], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[0], arc: { http: [ [ 'get', '/' ], [ 'post', '/post' ] ], app: [ 'mah-app' ] }},  'contains create lambda code with first of two routes')
  t.deepEqual(createcodeplans[1], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[1], arc: { http: [ [ 'get', '/' ], [ 'post', '/post' ] ], app: [ 'mah-app' ] }},  'contains create lambda code with second of two routes')
  var createdeployplans = plans.filter(x => x.action === 'create-http-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[0], arc: { http: [ [ 'get', '/' ], [ 'post', '/post' ] ], app: [ 'mah-app' ] }},  'contains create lambda deployment with first of two routes')
  t.deepEqual(createdeployplans[1], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[1], arc: { http: [ [ 'get', '/' ], [ 'post', '/post' ] ], app: [ 'mah-app' ] }},  'contains create lambda deployment with second of two routes')
  t.equal(plans.length, 11, '11 plans exist')
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
  t.equal(plans.length, 3, '3 plans exist')
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns http route creation plans if not local', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  t.plan(4)
  var plans = planner(arc)
  var createroutersplan = plans.filter(x => x.action === 'create-http-routers')
  t.deepEqual(createroutersplan[0], {action:'create-http-routers', app: base.app[0]}, 'contains create routers plan')
  var createhttprouteplans = plans.filter(x => x.action === 'create-http-route')
  t.deepEqual(createhttprouteplans[0], {action:'create-http-route', app: base.app[0], route:arc.http[0]},  'contains create http route with first of two routes')
  t.deepEqual(createhttprouteplans[1], {action:'create-http-route', app: base.app[0], route:arc.http[1]},  'contains create http route with second of two routes')
  var createrouterdeployplan = plans.filter(x => x.action === 'create-http-router-deployments')
  t.deepEqual(createrouterdeployplan[0], {action:'create-http-router-deployments', app: base.app[0]},  'contains create router deployments plan')
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
  t.deepEqual(createtablelambdaplans[0], {action:'create-table-lambda-code', table:{ppl:{personID:"*String",insert:"Lambda",update:"Lambda",delete:"Lambda"}}, app: base.app[0], arc: { tables: [ { posts: { postID: '*String', posted: '**String', ttl: 'TTL' } }, { ppl: { personID: '*String', insert: 'Lambda', update: 'Lambda', delete: 'Lambda' } } ], app: [ 'mah-app' ] }}, 'contains create table lambda for second table only')
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
