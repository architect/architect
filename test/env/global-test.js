var test = require('tape')
var env = require('../../src/env')

test('global', t=> {
  t.plan(1)
  t.ok(env, 'got env')
})

test('can read env', t=> {
  t.plan(1)
  /*
   * FIXME wip
  process.chdir('test/mock')
  env({
    exec: true
  }, 
  function _env(err, plans) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(plans, 'got the plan')
      console.log(JSON.stringify(plans, null, 2))
    }
  })
  */
  t.ok(true, 'wip')
})
