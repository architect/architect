let test = require('tape')
let sinon = require('sinon')
let inquirer = require('inquirer')

let help = require('../../../src/help')
let logstub = sinon.stub(help, 'log')

test('help function exists', t=> {
  t.plan(1)
  t.ok(help, 'help exists')
  t.end()
})

test('help should invoke inquirer if unrecognized subcommand provided', async t=> {
  t.plan(1)
  let inquirerstub = sinon.stub(inquirer, 'prompt').returns({
    help: 'obiwan'
  })
  let readstub = sinon.stub(help, 'read').returns('')
  await help.main(['help', 'me', 'obiwankenobi'])
  t.ok(inquirerstub.called, 'inquirer was called')
  inquirerstub.restore()
  readstub.restore()
  t.end()
})

test('known command reads appropriate doc file', async t=> {
  t.plan(1)
  let readspy = sinon.spy(help, 'read')
  await help.main(['help', 'deploy'])
  t.ok(readspy.firstCall.args[0].endsWith('doc/deploy.md'), 'read called with appropriate file path')
  readspy.restore()
  t.end()
})

test('help teardown', t=> {
  logstub.restore()
  t.end()
})
