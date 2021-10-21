let test = require('tape')
let proxyquire = require('proxyquire')

let bannered
let returned
let startup = {
  env: () => {},
  banner: params => bannered = { params }
}
let returner = (cmd, params) => returned = { cmd, params }
let reset = () => {
  bannered = null
  returned = null
  if (bannered || returned) throw Error('did not reset')
}

let arc = proxyquire('../../../src', {
  '@architect/create/cli': returner.bind({}, 'create'),
  '@architect/deploy/src/cli': returner.bind({}, 'deploy'),
  '@architect/env': returner.bind({}, 'env'),
  '@architect/hydrate/cli': returner.bind({}, 'hydrate'),
  '@architect/logs/cli': returner.bind({}, 'logs'),
  '@architect/package/cli': returner.bind({}, 'package'),
  '@architect/sandbox/src/cli/arc': returner.bind({}, 'sandbox'),
  '@architect/destroy/src/cli': returner.bind({}, 'destroy'),
  './startup': startup,
  './help': returner.bind({}, './help'),
  './version': returner.bind({}, './version'),
  'update-notifier': () => ({ notify: () => {} })
})


test('Help (and defaults)', t => {
  t.plan(9)
  arc([])
  t.equal(returned.cmd, './help', 'No arg defaults to help')
  t.equal(returned.params.length, 0, 'No options passed')
  t.notOk(bannered, 'Did not print banner')

  arc([ 'help' ])
  t.equal(returned.cmd, './help', 'Requesting help succeeds')
  t.equal(returned.params.length, 0, 'No options passed')
  t.notOk(bannered, 'Did not print banner')

  arc([ 'help', 'sandbox' ])
  t.equal(returned.cmd, './help', 'Requesting help with a command succeeds')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.notOk(bannered, 'Did not print banner')
  reset()
})

test('Commands', async t => {
  t.plan(57)
  await arc([ 'create' ])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.equal(returned.params.length, 0, 'No options passed')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'create', './foo' ])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'init' ])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.equal(returned.params.length, 0, 'No options passed')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'init', './foo' ])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'version' ])
  t.equal(returned.cmd, './version', 'Ran version')
  t.equal(returned.params.length, 0, 'No options passed')
  t.notOk(bannered, 'Did not print banner')

  await arc([ 'deploy' ])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'deploy', '--static' ])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'env' ])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'env', '--verify' ])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'hydrate' ])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'hydrate', '--update' ])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'logs' ])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'logs', '--idk' ])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'package' ])
  t.equal(returned.cmd, 'package', 'Ran package')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  // At this time package does not take CLI args
  await arc([ 'package', '--something' ])
  t.equal(returned.cmd, 'package', 'Ran package')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'sandbox' ])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'sandbox', '--port' ])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.equal(returned.params.length, 1, `Options passed: ${returned.params[0]}`)
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'destroy' ])
  t.equal(returned.cmd, 'destroy', 'Ran destroy')
  t.equal(returned.params.length, 0, 'No options passed')
  t.ok(bannered, 'Printed banner')
  reset()

  await arc([ 'destroy', '--name', 'my-app' ])
  t.equal(returned.cmd, 'destroy', 'Ran destroy')
  t.equal(returned.params.length, 2, `Options passed: ${returned.params[0]} ${returned.params[1]}`)
  t.ok(bannered, 'Printed banner')
  reset()
})
