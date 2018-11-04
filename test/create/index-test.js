var test = require('tape')
var proxyquire = require('proxyquire')

var base = {
  app: ['mah-app']
}

test('create command validates arc file', t=>{
  t.plan(1)
  var main = proxyquire('../../src/create', {
    './validate': function() {
      t.pass('validation function invoked')
      t.end()
    }
  })
  main({}, {})
})
test('create command feeds arc into planner and exec plans', t=>{
  t.plan(2)
  var main = proxyquire('../../src/create', {
    './validate': function(arc, raw, callback) {
      callback()
    },
    '../util/run-plugin': function(plug, arc, callback) {
      callback()
    },
    './_planner': function(arc) {
      t.deepEqual(arc, base, 'planner invoked with expected arc file')
    },
    './_exec': function(plans, callback) {
      t.ok('exec invoked')
      callback()
    }
  })
  main(base, {}, t.end)
})
