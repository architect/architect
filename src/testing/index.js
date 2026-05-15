/**
 * @architect/architect testing utilities
 *
 * Helper functions for plugin authors to mock Architect internals
 * when writing tests for their Architect plugins.
 *
 * @example
 * import { createMockInventory } from '@architect/architect/testing'
 *
 * test('my plugin works', async t => {
 *   let inventory = createMockInventory()
 *   // ... test plugin with mock inventory
 * })
 */

let {
  createMockArcManifest,
  createMockDeployConfig,
} = require('./arc-manifest')

let {
  createMockInventory,
  createMockInventoryItem,
} = require('./inventory')

let {
  createMockDeployContext,
  createMockSandboxContext,
  createMockLambdaInvocation,
  createMockPluginContext,
} = require('./contexts')

let {
  createHttpPragmaFixture,
  createEventsPragmaFixture,
  createQueuesPragmaFixture,
  createTablesPragmaFixture,
  createWebsocketPragmaFixture,
} = require('./pragmas')

let {
  deepCopy,
  mergeDeep,
  withDefaults,
} = require('./helpers')

module.exports = {
  // Arc manifest builders
  createMockArcManifest,
  createMockDeployConfig,

  // Inventory builders
  createMockInventory,
  createMockInventoryItem,

  // Context builders
  createMockDeployContext,
  createMockSandboxContext,
  createMockLambdaInvocation,
  createMockPluginContext,

  // Pragma fixtures
  createHttpPragmaFixture,
  createEventsPragmaFixture,
  createQueuesPragmaFixture,
  createTablesPragmaFixture,
  createWebsocketPragmaFixture,

  // Helper utilities
  deepCopy,
  mergeDeep,
  withDefaults,
}
