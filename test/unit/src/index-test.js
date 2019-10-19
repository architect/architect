let test = require('tape')
let proxyquire = require('proxyquire')

let befored
let returned
let beforer = (cmd, opts) => befored = {cmd, opts}
let returner = (cmd, opts) => returned = {cmd, opts}
let reset = () => {
  befored = null
  returned = null
  if (befored || returned) throw Error('did not reset')
}

let arc = proxyquire('../../../src', {
  '@architect/create/cli': returner.bind({}, 'create'),
  '@architect/deploy/cli': returner.bind({}, 'deploy'),
  '@architect/env': returner.bind({}, 'env'),
  '@architect/hydrate/cli': returner.bind({}, 'hydrate'),
  '@architect/logs/cli': returner.bind({}, 'logs'),
  '@architect/package/cli': returner.bind({}, 'package'),
  '@architect/repl': returner.bind({}, 'repl'),
  '@architect/sandbox/src/cli/arc': returner.bind({}, 'sandbox'),
  './before': beforer.bind({}, './before'),
  './help': returner.bind({}, './help'),
  './version': returner.bind({}, './version'),
  'update-notifier': () => ({notify: () => {}})
})


test('Help (and defaults)', t => {
  t.plan(9)
  arc([])
  t.equal(returned.cmd, './help', 'No arg defaults to help')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.notOk(befored, 'Did not run preflight ops')

  arc(['help'])
  t.equal(returned.cmd, './help', 'Requesting help succeeds')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.notOk(befored, 'Did not run preflight ops')

  arc(['help', 'repl'])
  t.equal(returned.cmd, './help', 'Requesting help with a command succeeds')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.notOk(befored, 'Did not run preflight ops')
  reset()
})

test('Commands', t => {
  t.plan(57)
  arc(['create'])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.notOk(befored, 'Did not run preflight ops')

  arc(['create', './foo'])
  t.equal(returned.cmd, 'create', 'Ran create')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.notOk(befored, 'Did not run preflight ops')

  arc(['init'])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.notOk(befored, 'Did not run preflight ops')

  arc(['init', './foo'])
  t.equal(returned.cmd, 'create', 'Ran create (via init)')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.notOk(befored, 'Did not run preflight ops')

  arc(['version'])
  t.equal(returned.cmd, './version', 'Ran version')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.notOk(befored, 'Did not run preflight ops')

  arc(['deploy'])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['deploy', '--static'])
  t.equal(returned.cmd, 'deploy', 'Ran deploy')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['env'])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['env', '--verify'])
  t.equal(returned.cmd, 'env', 'Ran env')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['hydrate'])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['hydrate', '--update'])
  t.equal(returned.cmd, 'hydrate', 'Ran hydrate')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['logs'])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['logs', '--idk'])
  t.equal(returned.cmd, 'logs', 'Ran logs')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['package'])
  t.equal(returned.cmd, 'package', 'Ran package')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  // At this time package does not take CLI args
  arc(['package', '--something'])
  t.equal(returned.cmd, 'package', 'Ran package')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['repl'])
  t.equal(returned.cmd, 'repl', 'Ran repl')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  // At this time repl does not take CLI args
  arc(['repl', '--something'])
  t.equal(returned.cmd, 'repl', 'Ran repl')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['sandbox'])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.equal(returned.opts.length, 0, 'No options passed')
  t.ok(befored, 'Ran preflight ops')
  reset()

  arc(['sandbox', '--port'])
  t.equal(returned.cmd, 'sandbox', 'Ran sandbox')
  t.equal(returned.opts.length, 1, `Options passed: ${returned.opts[0]}`)
  t.ok(befored, 'Ran preflight ops')
  reset()
})
