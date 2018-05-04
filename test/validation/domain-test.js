var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../src/create/aws/validate')

test('domain legit', t=> {
  t.plan(1)
  var arc = parse(`
@app
testy

@domain
ohai.com

@html
get /
  `)
  validate(arc, function _validate(err, result) {
    t.ok(err == null,`${arc.domain[0]} is a valid domain`)
  })
})

