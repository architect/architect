var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var apply = proxyquire('../../../src/config/apply', {
})

test('config apply should update lambda function config based on arc-config file', t=> {
  t.end()
})
