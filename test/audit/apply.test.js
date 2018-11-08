var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var syncStub = sinon.stub().callsFake(function(thing, callback) { callback() })
var apply = proxyquire('../../src/audit/_apply', {
  './_reads': function(arc, callback) { callback(null, [1,2,3]) },
  './_sync-role': syncStub
})

test('audit apply should invoke sync role on each element enumerated from reading arc', t=> {
  syncStub.resetHistory()
  t.plan(3)
  apply()
  process.nextTick(function() {
    t.equal(syncStub.args[0][0], 1, 'sync invoked with first arg')
    t.equal(syncStub.args[1][0], 2, 'sync invoked with second arg')
    t.equal(syncStub.args[2][0], 3, 'sync invoked with third arg')
    t.end()
  })
})
