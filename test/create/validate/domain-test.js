var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../../src/create/validate')

test('domain legit', t=> {
  t.plan(1)
  var raw = `
@app
testy

@domain
ohai.com

@html
get /
  `
  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    t.ok(err == null,`${arc.domain[0]} is a valid domain`)
    console.log('wat', err, result)
  })
})

