var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var publicMock = sinon.stub().callsFake(function(args, callback) { callback() })
var functionMock = sinon.stub().callsFake(function(args, callback) { callback() })
var oneMock = sinon.stub().callsFake(function(args, callback) { callback() })
var progressMock = sinon.spy()
var lambdaMock = sinon.stub().callsFake(function(args, callback) { callback() })
var deploy = proxyquire('../../src/deploy', { //stub out dependencies
  './public': publicMock,
  './lambda-all': functionMock,
  './lambda-one': oneMock,
  './helpers/progress': progressMock,
  './lambda-one/prep': lambdaMock
})
const spies = [publicMock, functionMock, oneMock, progressMock, lambdaMock]

function resetSpies() {
  for (var spy of spies) {
    spy.resetHistory()
  }
}

var base = {
  appname: ['testapp']
}

test('if static should invoke deployPublic', t=> {
  resetSpies()
  t.plan(1)
  deploy.main(base, {}, {isStatic: true}, () => {
    t.ok(publicMock.called, 'deployPublic invoked')
    t.end()
  })
})

/*

test('if path should invoke deployOne with the path', t=> {
  resetSpies()
  t.plan(2)
  deploy.main(base, {}, {isPath: true, all: ['src/blah']}, () => {
    t.ok(oneMock.called, 'deployOne invoked')
    t.equal(oneMock.args[0][0].pathToCode, 'src/blah', 'deployInvoked invoked with correct path')
    t.end()
  })

  test('if lambda should invoke deployFunctions', t=> { t.end() })
  test('should deploy everything with no qualifying args', t=> { t.end() })
})*/
