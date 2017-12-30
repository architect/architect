var test = require('tape')
var sandbox = require('../../src/sandbox').db
var client = require('../../src/sandbox/db/_get-db-client')

var server

test('setup', t=> {
  t.plan(1)
  server = sandbox.start(function _start() {
    t.ok(true, 'started server @ localhost:5000')
  })
})

test('can read db', t=> {
  t.plan(1)
  client.listTables({}, function _list(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

var TableName = 'testapp-production-accounts'

test('can insert a row', t=> {
  t.plan(1)
  client.putItem({
    TableName,
    Item: {
      accountID: {S: 'fake-account-id'},
      email: {S: 'b@brian.io'}
    }
  }, 
  function _put(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      console.log(result)
    }
  })
})

test('can read index', t=> {
  t.plan(1)
  client.describeTable({
    TableName
  }, 
  function _desc(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      console.log(result)    
    }
  })
})

test('can read the row', t=> {
  t.plan(1)
  client.getItem({
    TableName,
    Key: {
      accountID: {S:'fake-account-id'}
    }
  }, 
  function _desc(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      console.log(result)    
    }
  })
})

test('can query the row', t=> {
  t.plan(1)
  client.query({
    TableName,
    IndexName: 'email-index',
    KeyConditions: {
      email: {
        AttributeValueList: [{S: 'b@brian.io'}],
        ComparisonOperator: 'EQ'
      }
    }
  }, 
  function _desc(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      console.log(result)    
    }
  })
})

test('teardown', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'server closed')
})


