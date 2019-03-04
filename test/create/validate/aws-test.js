var test = require('tape')
var parse = require('@architect/parser')
var validate = require('../../../src/create/validate')
var validRuntimes = require('../../../src/util/get-runtime').validRuntimes

test('aws runtime must be node.js or provided', t=> {
  t.plan(validRuntimes.length)

  validRuntimes.forEach(runtime=> {
    var raw = `
@app
test-aws

@aws
runtime ${runtime}
    `
    var arc = parse(raw)
    validate(arc, raw, function _validate(err, result) {
      if (err) {
        t.fail('should be a valid runtime')
        return
      }
      t.ok(result, `${runtime} is a valid runtime`)
    })
  })
})

test('aws runtime should fail if not a valid runtime', t=> {
  t.plan(2)
  var raw = `
@app
test-aws

@aws
runtime python2
  `

  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      t.ok(/not supported/.test(err[0].message), 'not supported')
      console.log(err)
    }
    else {
      t.fail('succeeded with an invalid runtime')
    }
  })
})

test('aws runtime should fail if not a valid layer arn', t=> {
  t.plan(2)
  var raw = `
@app
test-aws

@aws
layer arn:invalid:layer
  `

  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed')
      t.ok(/not a valid arn/.test(err[0].message), 'not a valid arn')
      console.log(err)
    }
    else {
      t.fail('succeeded with an invalid runtime')
    }
  })
})

test('aws runtime should ve a valid arn', t=> {
  t.plan(1)
  var raw = `
@app
test-aws

@aws
layer arn:aws:lambda:us-east-2:123456789012:layer:my-layer:3
  `

  var arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.fail('should be a valid layer')
      return
    }
    t.ok(result, `${arc.aws[0][1]} is a valid layer`)
  })
})
