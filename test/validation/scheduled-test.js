var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../src/create/aws/validate')

test('scheduled env', t=> {
  t.plan(1)
  t.ok(validate, 'validate')
})

