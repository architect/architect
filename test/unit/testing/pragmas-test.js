let test = require('tape')
let {
  createHttpPragmaFixture,
  createEventsPragmaFixture,
  createQueuesPragmaFixture,
  createTablesPragmaFixture,
  createWebsocketPragmaFixture,
} = require('../../../src/testing')

test('createHttpPragmaFixture returns object with manifest and inventory', t => {
  t.plan(2)

  let fixture = createHttpPragmaFixture()

  t.ok(fixture.manifest, 'fixture has manifest')
  t.ok(fixture.inventory, 'fixture has inventory')
})

test('createHttpPragmaFixture configures http pragma', t => {
  t.plan(2)

  let fixture = createHttpPragmaFixture()

  t.ok(Array.isArray(fixture.manifest.http), 'manifest has http array')
  t.ok(Array.isArray(fixture.inventory.http), 'inventory has http array')
})

test('createHttpPragmaFixture uses default routes', t => {
  t.plan(2)

  let fixture = createHttpPragmaFixture()

  t.equal(fixture.manifest.http[0], 'get /', 'manifest has default route')
  t.equal(fixture.manifest.http[0], fixture.inventory.http[0], 'inventory matches manifest')
})

test('createHttpPragmaFixture accepts custom routes', t => {
  t.plan(2)

  let fixture = createHttpPragmaFixture({ routes: [ 'post /api', 'get /status' ] })

  t.equal(fixture.manifest.http.length, 2, 'manifest has custom routes')
  t.equal(fixture.inventory.http[0], 'post /api', 'first route correct')
})

test('createEventsPragmaFixture returns object with manifest and inventory', t => {
  t.plan(2)

  let fixture = createEventsPragmaFixture()

  t.ok(fixture.manifest, 'fixture has manifest')
  t.ok(fixture.inventory, 'fixture has inventory')
})

test('createEventsPragmaFixture configures events pragma', t => {
  t.plan(2)

  let fixture = createEventsPragmaFixture()

  t.ok(Array.isArray(fixture.manifest.events) || fixture.manifest.events, 'manifest has events')
  t.ok(Array.isArray(fixture.inventory.events) || fixture.inventory.events, 'inventory has events')
})

test('createEventsPragmaFixture uses default topics', t => {
  t.plan(2)

  let fixture = createEventsPragmaFixture()

  t.deepEqual(fixture.manifest.events, [ 'test-topic' ], 'manifest has default topic')
  t.deepEqual(fixture.inventory.events, fixture.manifest.events, 'inventory matches manifest')
})

test('createEventsPragmaFixture accepts custom topics', t => {
  t.plan(2)

  let fixture = createEventsPragmaFixture({ topics: [ 'order-created', 'order-shipped' ] })

  t.equal(fixture.manifest.events.length, 2, 'manifest has custom topics')
  t.equal(fixture.manifest.events[0], 'order-created', 'first topic correct')
})

test('createQueuesPragmaFixture returns object with manifest and inventory', t => {
  t.plan(2)

  let fixture = createQueuesPragmaFixture()

  t.ok(fixture.manifest, 'fixture has manifest')
  t.ok(fixture.inventory, 'fixture has inventory')
})

test('createQueuesPragmaFixture configures queues pragma', t => {
  t.plan(2)

  let fixture = createQueuesPragmaFixture()

  t.ok(Array.isArray(fixture.manifest.queues) || fixture.manifest.queues, 'manifest has queues')
  t.ok(Array.isArray(fixture.inventory.queues) || fixture.inventory.queues, 'inventory has queues')
})

test('createQueuesPragmaFixture uses default queues', t => {
  t.plan(2)

  let fixture = createQueuesPragmaFixture()

  t.deepEqual(fixture.manifest.queues, [ 'test-queue' ], 'manifest has default queue')
  t.deepEqual(fixture.inventory.queues, fixture.manifest.queues, 'inventory matches manifest')
})

test('createQueuesPragmaFixture accepts custom queues', t => {
  t.plan(2)

  let fixture = createQueuesPragmaFixture({ queues: [ 'priority-queue', 'background-jobs' ] })

  t.equal(fixture.manifest.queues.length, 2, 'manifest has custom queues')
  t.equal(fixture.manifest.queues[0], 'priority-queue', 'first queue correct')
})

test('createTablesPragmaFixture returns object with manifest and inventory', t => {
  t.plan(2)

  let fixture = createTablesPragmaFixture()

  t.ok(fixture.manifest, 'fixture has manifest')
  t.ok(fixture.inventory, 'fixture has inventory')
})

test('createTablesPragmaFixture configures tables pragma', t => {
  t.plan(2)

  let fixture = createTablesPragmaFixture()

  t.ok(Array.isArray(fixture.manifest.tables) || fixture.manifest.tables, 'manifest has tables')
  t.ok(Array.isArray(fixture.inventory.tables) || fixture.inventory.tables, 'inventory has tables')
})

test('createTablesPragmaFixture uses default tables', t => {
  t.plan(2)

  let fixture = createTablesPragmaFixture()

  t.deepEqual(fixture.manifest.tables, [ 'test-table' ], 'manifest has default table')
  t.deepEqual(fixture.inventory.tables, fixture.manifest.tables, 'inventory matches manifest')
})

test('createTablesPragmaFixture accepts custom tables', t => {
  t.plan(2)

  let fixture = createTablesPragmaFixture({ tables: [ 'users', 'orders', 'products' ] })

  t.equal(fixture.manifest.tables.length, 3, 'manifest has custom tables')
  t.equal(fixture.manifest.tables[0], 'users', 'first table correct')
})

test('createWebsocketPragmaFixture returns object with manifest and inventory', t => {
  t.plan(2)

  let fixture = createWebsocketPragmaFixture()

  t.ok(fixture.manifest, 'fixture has manifest')
  t.ok(fixture.inventory, 'fixture has inventory')
})

test('createWebsocketPragmaFixture configures websocket pragma', t => {
  t.plan(2)

  let fixture = createWebsocketPragmaFixture()

  t.equal(fixture.manifest.websocket, true, 'manifest has websocket enabled')
  t.equal(fixture.inventory.websocket, true, 'inventory has websocket enabled')
})

test('pragma fixtures are independent', t => {
  t.plan(2)

  let fixture1 = createHttpPragmaFixture({ routes: [ 'get /v1' ] })
  let fixture2 = createHttpPragmaFixture({ routes: [ 'get /v2' ] })

  t.equal(fixture1.manifest.http[0], 'get /v1', 'first fixture unchanged')
  t.equal(fixture2.manifest.http[0], 'get /v2', 'second fixture independent')
})
