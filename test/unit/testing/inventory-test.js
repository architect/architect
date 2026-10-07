let test = require('tape')
let { createMockInventory, createMockInventoryItem } = require('../../../src/testing')

test('createMockInventory returns valid object', t => {
  t.plan(3)

  let inventory = createMockInventory()

  t.ok(inventory, 'inventory exists')
  t.ok(typeof inventory.get === 'function', 'has get method')
  t.equal(inventory.app, 'test-app', 'has default app name')
})

test('createMockInventory has required properties', t => {
  t.plan(5)

  let inventory = createMockInventory()

  t.ok(inventory.env, 'has env property')
  t.ok(Array.isArray(inventory.http), 'http is array')
  t.ok(typeof inventory.inv === 'object', 'has inv property')
  t.ok(typeof inventory.lambdaVersions === 'object', 'has lambdaVersions property')
  t.ok(inventory.get, 'has get method')
})

test('createMockInventory accepts app override', t => {
  t.plan(1)

  let inventory = createMockInventory({ app: 'my-custom-app' })

  t.equal(inventory.app, 'my-custom-app', 'app name overridden correctly')
})

test('createMockInventory accepts env override', t => {
  t.plan(2)

  let inventory = createMockInventory({
    env: { CUSTOM_VAR: 'custom-value' },
  })

  t.equal(inventory.env.testing, 'SECRET_VALUE', 'preserves default env vars')
  t.equal(inventory.env.CUSTOM_VAR, 'custom-value', 'adds custom env vars')
})

test('createMockInventory accepts http override', t => {
  t.plan(2)

  let inventory = createMockInventory({ http: [ 'post /api', 'get /status' ] })

  t.equal(inventory.http.length, 2, 'http routes updated')
  t.equal(inventory.http[0], 'post /api', 'first route correct')
})

test('createMockInventory.get() returns http routes', t => {
  t.plan(2)

  let inventory = createMockInventory()
  let http = inventory.get('http')

  t.ok(http, 'get returns http route')
  t.deepEqual(http, inventory.http[0], 'returns first http item')
})

test('createMockInventory.get() returns undefined for missing type', t => {
  t.plan(1)

  let inventory = createMockInventory()
  let result = inventory.get('nonexistent')

  t.equal(result, undefined, 'returns undefined for unknown type')
})

test('createMockInventoryItem builds http items', t => {
  t.plan(3)

  let httpItem = createMockInventoryItem('http', 'get-index')

  t.equal(httpItem.method, 'GET', 'http item has method')
  t.equal(httpItem.path, '/get-index', 'path generated correctly')
  t.ok(httpItem.src.includes('get-index'), 'src path generated correctly')
})

test('createMockInventoryItem builds event items', t => {
  t.plan(2)

  let eventItem = createMockInventoryItem('event', 'process-data')

  t.equal(eventItem.name, 'process-data', 'event item has name')
  t.ok(eventItem.src.includes('process-data'), 'src path generated correctly')
})

test('createMockInventoryItem builds queue items', t => {
  t.plan(2)

  let queueItem = createMockInventoryItem('queue', 'my-queue')

  t.equal(queueItem.name, 'my-queue', 'queue item has name')
  t.ok(queueItem.src.includes('my-queue'), 'src path generated correctly')
})

test('createMockInventoryItem builds table items', t => {
  t.plan(2)

  let tableItem = createMockInventoryItem('table', 'my-table')

  t.equal(tableItem.name, 'my-table', 'table item has name')
  t.equal(tableItem.src, undefined, 'table src is undefined')
})

test('createMockInventoryItem accepts options', t => {
  t.plan(2)

  let httpItem = createMockInventoryItem('http', 'api', {
    method: 'POST',
    src: 'custom/path',
  })

  t.equal(httpItem.method, 'POST', 'method overridden')
  t.equal(httpItem.src, 'custom/path', 'src overridden')
})

test('createMockInventoryItem defaults unknown types to empty object', t => {
  t.plan(1)

  let unknown = createMockInventoryItem('unknown', 'item')

  t.deepEqual(unknown, {}, 'unknown type returns empty object')
})
