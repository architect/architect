let test = require('tape')
let proxyquire = require('proxyquire')

let bannered
let returned
let startup = {
  env: () => {},
  banner: params => bannered = { params },
}
let returner = (cmd, params) => returned = { cmd, params }
let invThrow = false
let inv = async () => {
  if (invThrow) throw new Error('boom')
  return {}
}
let pauser = { unpause: () => ({}) }
let reset = () => {
  bannered = null
  returned = null
  invThrow = false
  if (bannered || returned) throw Error('did not reset')
}

let arc = proxyquire('../../../src', {
  '@architect/inventory': inv,
  '@architect/create/src/cli': returner.bind({}, 'create'),
  '@architect/deploy/src/cli': returner.bind({}, 'deploy'),
  '@architect/deploy/src/utils/pause-sandbox': pauser,
  '@architect/destroy/src/cli': returner.bind({}, 'destroy'),
  '@architect/env/src/cli': returner.bind({}, 'env'),
  '@architect/hydrate/src/cli': returner.bind({}, 'hydrate'),
  '@architect/logs/src/cli': returner.bind({}, 'logs'),
  '@architect/sandbox/src/cli/arc': returner.bind({}, 'sandbox'),
  './startup': startup,
  './help': returner.bind({}, './help'),
  './version': returner.bind({}, './version'),
  'update-notifier-cjs': () => ({ notify: () => {} }),
})


test('Help (and defaults)', t => {
  t.plan(21)
  arc([])
  t.equal(returned.cmd, './help', 'No arg defaults to help')
  t.equal(returned.params.length, 0, '..no options passed')
  t.notOk(bannered, '..did not print banner')

  arc([ 'help' ])
  t.equal(returned.cmd, './help', 'Requesting help via `arc help` succeeds')
  t.equal(returned.params.length, 0, '..no options passed')
  t.notOk(bannered, '..did not print banner')
  reset()

  arc([ '--help' ])
  t.equal(returned.cmd, './help', 'Requesting --help succeeds')
  t.equal(returned.params.length, 0, '..no options passed')
  t.notOk(bannered, '..did not print banner')
  reset()

  arc([ '-h' ])
  t.equal(returned.cmd, './help', 'Requesting help via -h succeeds')
  t.equal(returned.params.length, 0, '..no options passed')
  t.notOk(bannered, '..did not print banner')
  reset()

  arc([ 'help', 'sandbox' ])
  t.equal(returned.cmd, './help', 'Requesting help with a command succeeds')
  t.equal(returned.params.length, 1, `..options passed: ${returned.params[0]}`)
  t.notOk(bannered, '..did not print banner')
  reset()

  arc([ 'sandbox', '-h' ])
  t.equal(returned.cmd, './help', 'Requesting help via -h with a command succeeds')
  t.equal(returned.params.length, 1, `..options passed: ${returned.params[0]}`)
  t.notOk(bannered, '..did not print banner')
  reset()

  arc([ 'sandbox', '--help' ])
  t.equal(returned.cmd, './help', 'Requesting help via --help with a command succeeds')
  t.equal(returned.params.length, 1, `..options passed: ${returned.params[0]}`)
  t.notOk(bannered, '..did not print banner')
  reset()
})

test('Commands', async t => {
  t.plan(68)
  await arc([ 'create' ])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'create', './foo' ])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'init' ])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'init', './foo' ])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'version' ])
  t.equal(returned.cmd, './version', 'Ran version')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'deploy' ])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'deploy', '--static' ])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'env' ])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'env', '--verify' ])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'hydrate' ])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'hydrate', '--update' ])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'logs' ])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'logs', '--idk' ])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'sandbox' ])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'sandbox', '--port' ])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'destroy' ])
  t.equal(returned.cmd, 'destroy', 'Ran destroy')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'destroy', '--name', 'my-app' ])
  t.equal(returned.cmd, 'destroy', 'Ran destroy')
  t.ok(returned.params, 'Passed options')
  t.ok(returned.params.inventory, 'Passed Inventory')
  t.ok(bannered, 'Printed banner')
  reset()
})

test('Non-zero exit codes', async t => {
  t.notOk(await arc([ 'not-a-command' ]), 'index module should return false when provided an unknown command, signaling exit code 1')
  reset()
  invThrow = true
  t.notOk(await arc([ 'logs' ]), 'index module should return false when command execution throws, signaling exit code 1')
  reset()
})
