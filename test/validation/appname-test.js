var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../src/create/validate')

test('env', t=> {
  t.plan(1)
  t.ok(validate, 'validate')
})

test('appname must exist', t=> {
  t.plan(1)
  var raw = `
@html
get /
  `
  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      console.log(err)
    }
    else {
      t.fail('empty @app still worked')
    }
  })
})

test('appname must be 20 chars or less', t=> {
  t.plan(1)
  var raw = `
@app
this-name-is-way-too-long-sorry-breaux

@html
get /
  `
  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      console.log(err)
    }
    else {
      t.fail('empty @app still worked')
    }
  })
})

test('appname must only contain letters, numbers, and dashes', t=> {
  t.plan(1)
  var raw = `
@app
COOL.com

@html
get /
  `
  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      console.log(err)
    }
    else {
      t.fail('invalid chars somehow worked')
    }
  })
})

test('appname must only contain letters, numbers, and dashes', t=> {
  t.plan(2)
  var raw = `
@app
rad-app-1

@html
get /
  `
  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    t.ok(err == null, 'legit app name')
    t.ok(/^[a-z]/.test(arc.app[0]), 'first char is a lowercase letter')
  })
})
