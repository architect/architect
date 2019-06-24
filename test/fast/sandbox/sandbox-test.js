let path = require('path')
let test = require('tape')
let spawn = require('child_process').spawn
let sandbox = require('../../../src/sandbox')

// Test Architect's implementation of @architect/sandbox
test('sandbox.start', t=> {
  t.plan(2)
  t.ok(sandbox, 'has sandbox')
  t.ok(sandbox.start, 'has sandbox.start')
})

let asyncClose
test('async sandbox.start test/mock', async t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, 'mock'))
  asyncClose = await sandbox.start()
  t.ok(asyncClose, 'started')
})

test('async sandbox.close', async t=> {
  t.plan(1)
  asyncClose()
  t.ok(true, 'closed')
})

let syncClose
test('sync sandbox.start test/mock', t=> {
  t.plan(1)
  console.time('start')
  sandbox.start({}, function (err, end) {
    if (err) t.fail('Sandbox startup failure')
    else {
      console.timeEnd('start')
      syncClose = end
      t.ok(syncClose, 'started')
    }
  })
})

test('sync sandbox.close', t=> {
  t.plan(1)
  syncClose()
  t.ok(true, 'closed')
})

test('CLI sandbox', t => {
  t.plan(1)
  let result = spawn('../../../../src/sandbox/cli.js')
  let output
  let start = Date.now()
  result.stdout.on('data', (data) => {
    output += data
    if (output.includes(`Started HTTP "server"`)) {
      result.kill('SIGINT')
      t.ok(true, 'CLI started')
    }
  })
  if (result.error) {
    t.fail('CLI failed to start')
  }
})
