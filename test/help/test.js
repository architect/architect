var test = require('tape')
var sinon = require('sinon')
var inquirer = require('inquirer')

var help = require('../../src/help')
var logstub = sinon.stub(help, 'log')

test('help function exists', t=> {
  t.plan(1)
  t.ok(help, 'help exists')
  t.end()
})

test('help should invoke inquirer if unrecognized subcommand provided', async t=> {
  t.plan(1)
  var inquirerstub = sinon.stub(inquirer, 'prompt').returns({
    help: 'obiwan'
  })
  var readstub = sinon.stub(help, 'read').returns('')
  await help.main(['help', 'me', 'obiwankenobi'])
  t.ok(inquirerstub.called, 'inquirer was called')
  inquirerstub.restore()
  readstub.restore()
  t.end()
})

test('known command reads appropriate doc file', async t=> {
  t.plan(1)
  var readspy = sinon.spy(help, 'read')
  await help.main(['help', 'deploy'])
  t.ok(readspy.firstCall.args[0].endsWith('help/doc/deploy.md'), 'read called with appropriate file path')
  readspy.restore()
  t.end()
})

test('help teardown', t=> {
  logstub.restore()
  t.end()
})
