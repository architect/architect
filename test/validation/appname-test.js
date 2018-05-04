var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../src/create/aws/validate')

test('env', t=> {
  t.plan(1)
  t.ok(validate, 'validate')
})

test('appname must exist', t=> {
  t.plan(1)
  var arc = parse(`
@html
get /
  `)
  validate(arc, function _validate(err, result) {
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
  var arc = parse(`
@app
this-name-is-way-too-long-sorry-breaux

@html
get /
  `)
  validate(arc, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      console.log(err)
    }
    else {
      t.fail('empty @app still worked')
    }
  })
})

test('appname must only contain letters, numbers and dashes', t=> {
  t.plan(1)
  var arc = parse(`
@app
COOL.com

@html
get /
  `)
  validate(arc, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      console.log(err)
    }
    else {
      t.fail('invalid chars somehow worked')
    }
  })
})

test('appname must only contain letters, numbers and dashes', t=> {
  t.plan(2)
  var arc = parse(`
@app
this-name-is-way

@html
get /
  `)
  validate(arc, function _validate(err, result) {
    t.ok(err == null, 'legit app name')
    t.ok(/^[a-z]/.test(arc.app[0]), 'first char is a lowercase letter')
  })
})

