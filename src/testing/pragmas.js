/**
 * Pragma-specific testing fixtures
 */

let { createMockInventory } = require('./inventory')
let { createMockArcManifest } = require('./arc-manifest')

/**
 * Create a fixture with @http pragma configured
 * @param {Object} options - Override options (routes, etc)
 * @returns {Object} Fixture with http pragma
 *
 * @example
 * let fixture = createHttpPragmaFixture()
 * let fixture = createHttpPragmaFixture({
 *   routes: ['post /api', 'delete /api/:id']
 * })
 */
function createHttpPragmaFixture (options) {
  let routes = (options && options.routes) || [ 'get /' ]

  return {
    manifest: createMockArcManifest({ http: routes }),
    inventory: createMockInventory({ http: routes }),
  }
}

/**
 * Create a fixture with @events pragma configured
 * @param {Object} options - Override options
 * @returns {Object} Fixture with events pragma
 */
function createEventsPragmaFixture (options) {
  let topics = (options && options.topics) || [ 'test-topic' ]

  return {
    manifest: createMockArcManifest({ events: topics }),
    inventory: createMockInventory({ events: topics }),
  }
}

/**
 * Create a fixture with @queues pragma configured
 * @param {Object} options - Override options
 * @returns {Object} Fixture with queues pragma
 */
function createQueuesPragmaFixture (options) {
  let queues = (options && options.queues) || [ 'test-queue' ]

  return {
    manifest: createMockArcManifest({ queues: queues }),
    inventory: createMockInventory({ queues: queues }),
  }
}

/**
 * Create a fixture with @tables pragma configured
 * @param {Object} options - Override options
 * @returns {Object} Fixture with tables pragma
 */
function createTablesPragmaFixture (options) {
  let tables = (options && options.tables) || [ 'test-table' ]

  return {
    manifest: createMockArcManifest({ tables: tables }),
    inventory: createMockInventory({ tables: tables }),
  }
}

/**
 * Create a fixture with @websocket pragma configured
 * @param {Object} options - Override options
 * @returns {Object} Fixture with websocket pragma
 */
function createWebsocketPragmaFixture () {
  return {
    manifest: createMockArcManifest({ websocket: true }),
    inventory: createMockInventory({ websocket: true }),
  }
}

module.exports = {
  createHttpPragmaFixture,
  createEventsPragmaFixture,
  createQueuesPragmaFixture,
  createTablesPragmaFixture,
  createWebsocketPragmaFixture,
}
