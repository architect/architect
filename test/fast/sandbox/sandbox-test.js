let cli = require('@architect/sandbox').cli
let path = require('path')
let test = require('tape')
let spawn = require('child_process').spawn
let sandbox = require('../../../src/sandbox')

// Test Architect's implementation of @architect/sandbox
test('sandbox.start', t=> {
  t.plan(3)
  t.ok(sandbox, 'Has sandbox')
  t.ok(sandbox.start, 'Has sandbox.start')
  t.ok(cli, 'Has CLI')
})

let asyncClose
test('Async sandbox.start test/mock', async t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, 'mock'))
  asyncClose = await sandbox.start()
  t.ok(asyncClose, 'Sandbox started (async)')
})

test('Async sandbox.close', async t=> {
  t.plan(1)
  asyncClose()
  t.ok(true, 'Sandbox closed')
})

let syncClose
test('Sync sandbox.start test/mock', t=> {
  t.plan(1)
  sandbox.start({}, function (err, end) {
    if (err) t.fail('Sandbox failed (sync)')
    else {
      syncClose = end
      t.ok(syncClose, 'Sandbox started (sync)')
    }
  })
})

test('Sync sandbox.close', t=> {
  t.plan(1)
  syncClose()
  t.ok(true, 'Sandbox closed')
})

// Test below checks actual CLI impl, but may intermittently fail due to time required to close up all threads
// Open to other ideas on how to test the actual impl!
/*
test('CLI sandbox', t => {
  t.plan(1)
  let result = spawn('../../../../src/sandbox/cli.js')
  let output = ''
  result.stdout.on('data', (data) => {
    output += data
    if (output.includes(`Local environment ready!`)) {
      console.log(output)
      result.kill('SIGINT')
      t.ok(true, 'Sandbox CLI started')
    }
  })
  result.on('error', err => {
    console.log('', err)
    t.fail()
  })
})
*/

test('CLI sandbox', t => {
  t.plan(1)
  cli({}, function done (err, close) {
    if (err) t.fail(err)
    else {
      if (close) close()
      t.ok(true, 'Sandbox CLI started')
      t.end()
      process.exit(0) // CLI holds process open, ofc
    }
  })
})
