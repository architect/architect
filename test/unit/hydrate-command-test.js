let test = require('tape')
let sinon = require('sinon')
let proxyquire = require('proxyquire')
let hydrateStub = sinon.stub().resolves()
let hydrateCmd = proxyquire('../../src/commands/hydrate', {
  '@architect/hydrate': hydrateStub
})

test('hydrate command should invoke hydrate module with install parameter by default', async t => {
  t.plan(1)
  await hydrateCmd()
  t.ok(hydrateStub.calledWith({install:true}), 'hydate module called with install:true')
})
