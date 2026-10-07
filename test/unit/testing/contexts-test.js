let test = require('tape')
let {
  createMockDeployContext,
  createMockSandboxContext,
  createMockLambdaInvocation,
  createMockPluginContext,
} = require('../../../src/testing')

test('createMockDeployContext returns valid object', t => {
  t.plan(4)

  let context = createMockDeployContext()

  t.ok(context, 'context exists')
  t.ok(context.cloudformation, 'has cloudformation')
  t.ok(context.inventory, 'has inventory')
  t.ok(context.arc, 'has arc')
})

test('createMockDeployContext has required properties', t => {
  t.plan(4)

  let context = createMockDeployContext()

  t.equal(context.stage, 'staging', 'has stage')
  t.equal(context.region, 'us-west-2', 'has region')
  t.ok(typeof context.inventory.get === 'function', 'inventory has get method')
  t.equal(context.arc.app, 'test-app', 'arc has app name')
})

test('createMockDeployContext creates valid inventory internally', t => {
  t.plan(2)

  let context = createMockDeployContext()

  t.ok(Array.isArray(context.inventory.http), 'inventory has http')
  t.equal(typeof context.inventory.get, 'function', 'inventory has get method')
})

test('createMockDeployContext accepts stage override', t => {
  t.plan(1)

  let context = createMockDeployContext({ stage: 'production' })

  t.equal(context.stage, 'production', 'stage overridden')
})

test('createMockDeployContext accepts inventory override', t => {
  t.plan(1)

  let customInventory = { app: 'custom-app', get: () => {} }
  let context = createMockDeployContext({ inventory: customInventory })

  t.equal(context.inventory.app, 'custom-app', 'inventory overridden')
})

test('createMockDeployContext accepts arc override', t => {
  t.plan(1)

  let customArc = { app: 'custom-arc' }
  let context = createMockDeployContext({ arc: customArc })

  t.equal(context.arc.app, 'custom-arc', 'arc overridden')
})

test('createMockSandboxContext returns valid object', t => {
  t.plan(4)

  let context = createMockSandboxContext()

  t.ok(context, 'context exists')
  t.equal(context.type, 'http', 'has type')
  t.ok(context.inventory, 'has inventory')
  t.ok(context.arc, 'has arc')
})

test('createMockSandboxContext has required properties', t => {
  t.plan(2)

  let context = createMockSandboxContext()

  t.ok(typeof context.env === 'object', 'has env')
  t.ok(typeof context.inventory.get === 'function', 'inventory is valid')
})

test('createMockSandboxContext accepts type override', t => {
  t.plan(1)

  let context = createMockSandboxContext({ type: 'event' })

  t.equal(context.type, 'event', 'type overridden')
})

test('createMockLambdaInvocation returns valid object', t => {
  t.plan(3)

  let event = createMockLambdaInvocation()

  t.ok(event, 'event exists')
  t.ok(event.requestContext, 'has requestContext')
  t.ok(event.headers, 'has headers')
})

test('createMockLambdaInvocation has required properties', t => {
  t.plan(3)

  let event = createMockLambdaInvocation()

  t.equal(event.requestContext.http.method, 'GET', 'has default method')
  t.equal(event.requestContext.http.path, '/', 'has default path')
  t.ok(event.body, 'has body')
})

test('createMockLambdaInvocation accepts override', t => {
  t.plan(2)

  let event = createMockLambdaInvocation({
    requestContext: { http: { method: 'POST' } },
  })

  t.equal(event.requestContext.http.method, 'POST', 'method overridden')
  t.equal(event.requestContext.http.path, '/', 'path preserved as default')
})

test('createMockLambdaInvocation creates valid body', t => {
  t.plan(2)

  let event = createMockLambdaInvocation()

  t.equal(typeof event.body, 'string', 'body is string')
  t.deepEqual(JSON.parse(event.body), {}, 'body parses to empty object by default')
})

test('createMockPluginContext returns valid object', t => {
  t.plan(3)

  let context = createMockPluginContext()

  t.ok(context, 'context exists')
  t.ok(context.arc, 'has arc')
  t.ok(context.inventory, 'has inventory')
})

test('createMockPluginContext has required properties', t => {
  t.plan(2)

  let context = createMockPluginContext()

  t.equal(context.arc.app, 'test-app', 'arc configured')
  t.equal(typeof context.inventory.get, 'function', 'inventory valid')
})

test('createMockPluginContext accepts arc override', t => {
  t.plan(1)

  let context = createMockPluginContext({ arc: { app: 'my-plugin-app' } })

  t.equal(context.arc.app, 'my-plugin-app', 'arc overridden')
})

test('createMockPluginContext creates inventory if not provided', t => {
  t.plan(1)

  let context = createMockPluginContext()

  t.ok(context.inventory.app, 'inventory created automatically')
})

test('multiple contexts are independent', t => {
  t.plan(2)

  let context1 = createMockDeployContext({ stage: 'staging' })
  let context2 = createMockDeployContext({ stage: 'production' })

  t.equal(context1.stage, 'staging', 'first context unchanged')
  t.equal(context2.stage, 'production', 'second context independent')
})
