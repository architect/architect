let test = require('tape')
let {
  createMockInventory,
  createMockArcManifest,
  createMockDeployContext,
  createMockPluginContext,
  createHttpPragmaFixture,
} = require('../../../src/testing')

test('All builders work together', t => {
  t.plan(1)

  let arc = createMockArcManifest({ app: 'integrated-app' })
  let inventory = createMockInventory({ app: arc.app })
  let context = createMockDeployContext({ arc, inventory })

  t.ok(context, 'all builders compose successfully')
})

test('DeployContext contains valid sub-objects', t => {
  t.plan(5)

  let context = createMockDeployContext()

  t.ok(context.arc, 'has arc')
  t.ok(context.inventory, 'has inventory')
  t.ok(context.cloudformation, 'has cloudformation')
  t.equal(typeof context.inventory.get, 'function', 'inventory has get method')
  t.ok(Array.isArray(context.arc.http), 'arc has http array')
})

test('PluginContext can be used for real plugin scenarios', t => {
  t.plan(3)

  let pluginContext = createMockPluginContext({
    arc: { app: 'my-plugin-test' },
  })

  t.equal(pluginContext.arc.app, 'my-plugin-test', 'plugin context configured')
  t.ok(pluginContext.inventory.get, 'can call inventory methods')
  t.equal(typeof pluginContext.inventory.http, 'object', 'inventory has pragmas')
})

test('Pragma fixtures work with deploy context', t => {
  t.plan(3)

  let httpFixture = createHttpPragmaFixture({
    routes: [ 'post /api/users', 'get /api/users/:id' ],
  })

  let context = createMockDeployContext({
    arc: httpFixture.manifest,
    inventory: httpFixture.inventory,
  })

  t.equal(context.arc.http.length, 2, 'context has http routes from fixture')
  t.equal(context.inventory.http.length, 2, 'inventory has http routes from fixture')
  t.equal(context.arc.http[0], 'post /api/users', 'routes are correct')
})

test('Multiple contexts are completely independent', t => {
  t.plan(3)

  let context1 = createMockDeployContext({
    stage: 'development',
    region: 'us-east-1',
  })

  let context2 = createMockDeployContext({
    stage: 'production',
    region: 'eu-west-1',
  })

  t.equal(context1.stage, 'development', 'context1 stage correct')
  t.equal(context2.stage, 'production', 'context2 stage correct')
  t.equal(context1.region, 'us-east-1', 'contexts completely independent')
})

test('Builder output works with plugin hook patterns', t => {
  t.plan(5)

  // Simulate a plugin deploy hook scenario
  let inventory = createMockInventory()
  let arc = createMockArcManifest({ app: 'plugin-test-app' })
  let context = createMockDeployContext({
    arc,
    inventory,
    cloudformation: { Resources: {} },
  })

  // Plugin hook would receive these
  let hookParams = {
    arc: context.arc,
    inventory: context.inventory,
    cloudformation: context.cloudformation,
  }

  t.ok(hookParams.arc, 'hook receives arc')
  t.ok(hookParams.inventory, 'hook receives inventory')
  t.ok(hookParams.cloudformation, 'hook receives cloudformation')
  t.equal(hookParams.arc.app, 'plugin-test-app', 'hook gets correct arc data')
  t.ok(typeof hookParams.inventory.get === 'function', 'hook inventory is functional')
})

test('Overrides cascade correctly through builders', t => {
  t.plan(3)

  let inventory = createMockInventory({ app: 'cascaded-app' })
  let arc = createMockArcManifest({ app: 'cascaded-app' })
  let context = createMockDeployContext({
    arc,
    inventory,
    stage: 'cascaded-stage',
  })

  t.equal(context.arc.app, 'cascaded-app', 'arc app preserved')
  t.equal(context.inventory.app, 'cascaded-app', 'inventory app preserved')
  t.equal(context.stage, 'cascaded-stage', 'stage override applied')
})

test('Builders with complex nested overrides', t => {
  t.plan(3)

  let inventory = createMockInventory({
    env: {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
    },
  })

  t.equal(inventory.env.testing, 'SECRET_VALUE', 'preserves default env vars')
  t.equal(inventory.env.DB_HOST, 'localhost', 'adds custom env vars')
  t.equal(inventory.env.DB_PORT, '5432', 'multiple custom env vars work')
})
