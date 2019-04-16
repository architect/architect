let test = require('tape')
let parse = require('@architect/parser')
let validate = require('../../../src/create/validate')
let validRuntimes = require('../../../src/util/get-runtime').validRuntimes

test('aws runtime must be valid', t=> {
  t.plan(1)
  let raw = `
@app
test-aws

@aws
runtime python3.7
`
  let arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.fail('should be a valid runtime')
      return
    }
    t.ok(result, `runtime is valid`)
  })
})

test('invalid runtime should fall back to default (node 8.10)', t=> {
  t.plan(1)
  let raw = `
@app
test-aws

@aws
runtime python2
`
  let arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.fail('failed with an invalid runtime, should have fallen back to default')
    }
    else {
      t.ok(true, 'succeeded with an invalid runtime')
    }
  })
})


test('layer should be valid, and be in the same region as the lambda', t=> {
  t.plan(1)
  process.env.AWS_REGION = 'us-east-1'
  let raw = `
@app
test-aws

@aws
layer arn:aws:lambda:us-east-1:123456789012:layer:my-layer:3
`
  let arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.fail('should be a valid layer')
      console.log(err)
      return
    }
    else {
      t.ok(result, `${arc.aws[0][1]} is a valid layer`)
    }
  })
})

test('layer should be invalid if not in the same region as the lambda', t=> {
  t.plan(1)
  let raw = `
@app
test-aws

@aws
layer arn:aws:lambda:us-east-2:123456789012:layer:my-layer:3
`
  let arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok('layer is invalid')
      console.log(err.message)
      return
    }
    else {
      t.fail(result, `${arc.aws[0][1]} is an invalid layer`)
    }
  })
})

test('layer should fail if not a valid arn', t=> {
  t.plan(1)
  let raw = `
@app
test-aws

@aws
layer arn:invalid:layer
`
  let arc = parse(raw)
  validate(arc, raw, function _validate(err, result) {
    if (err) {
      t.ok(true, 'failed due to invalid layer arn')
      console.log(err)
    }
    else {
      t.fail('should not have succeeded with an invalid arn')
    }
  })
})
