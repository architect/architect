/**
 * Inventory mock builders
 */

let { DEFAULT_INVENTORY } = require('./defaults')
let { deepCopy } = require('./helpers')

/**
 * Create a mock inventory object
 * @param {Object} options - Override options
 * @returns {Object} Mock inventory
 *
 * @example
 * let inventory = createMockInventory()
 * let inventory = createMockInventory({ app: 'my-app' })
 */
function createMockInventory (options) {
  // Create base from defaults
  let base = {
    app: DEFAULT_INVENTORY.app,
    env: deepCopy(DEFAULT_INVENTORY.env),
    http: deepCopy(DEFAULT_INVENTORY.http),
    inv: deepCopy(DEFAULT_INVENTORY.inv),
    lambdaVersions: deepCopy(DEFAULT_INVENTORY.lambdaVersions),
    // Preserve the get function
    get: DEFAULT_INVENTORY.get,
  }

  if (options) {
    if (options.app) base.app = options.app
    if (options.env) base.env = { ...base.env, ...options.env }
    if (options.http) base.http = options.http
    if (options.events) base.events = options.events
    if (options.queues) base.queues = options.queues
    if (options.tables) base.tables = options.tables
    if (options.websocket) base.websocket = options.websocket
  }

  return base
}

/**
 * Create individual inventory item
 * @param {String} type - Type of item (http, event, queue, table)
 * @param {String} name - Name of the item
 * @param {Object} options - Override options
 * @returns {Object} Mock inventory item
 *
 * @example
 * let httpItem = createMockInventoryItem('http', 'get-index')
 * let eventItem = createMockInventoryItem('event', 'my-event', { topic: 'custom' })
 */
function createMockInventoryItem (type, name, options) {
  let defaults = {
    http: {
      method: 'GET',
      path: `/${name}`,
      src: `src/http/get-${name}`,
    },
    event: {
      name: name,
      src: `src/events/${name}`,
    },
    queue: {
      name: name,
      src: `src/queues/${name}`,
    },
    table: {
      name: name,
      src: undefined,
    },
  }

  let item = defaults[type] || {}

  if (options) {
    item = { ...item, ...options }
  }

  return item
}

module.exports = {
  createMockInventory,
  createMockInventoryItem,
}
