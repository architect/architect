var test = require('tape')
var proxyquire = require('proxyquire')
var mkdir = require('mkdirp')
var fs = require('fs')
var sinon = require('sinon')
let mkdirStub = sinon.stub(mkdir, 'sync')
let copyStub = sinon.stub()

var deployPublic = proxyquire('../../../../src/deploy/public', {
  './_copy-to-s3': copyStub
})

var base = {
  appname: ['testapp']
}

test('deploy/public should ignore if arc is missing static param', t=> {
  t.plan(1)
  deployPublic({ arc: base, env: '' }, () => {
    t.ok(!mkdirStub.called, 'mkdir not called')
    t.end()
  })
})

test('deploy/public should make a public dir if theres a static param', t=> {
  t.plan(1)
  var arc = Object.assign(base, {static:[['staging', 'stagingbucket'], ['production', 'prodbucket']]})
  let readStub = sinon.stub(fs, 'readdir').callsFake((path, callback) => callback(null, []))
  deployPublic({ arc, env: '' }, () => {
    t.ok(mkdirStub.called, 'mkdir called')
    readStub.restore()
    t.end()
  })
})

test('deploy/public should not invoke copy if public dir is empty', t=> {
  t.plan(1)
  var arc = Object.assign(base, {static:[['staging', 'stagingbucket'], ['production', 'prodbucket']]})
  let readStub = sinon.stub(fs, 'readdir').callsFake((path, callback) => callback(null, []))
  deployPublic({ arc, env: '' }, () => {
    t.ok(!copyStub.called, 'copy not called')
    readStub.restore()
    t.end()
  })
})

test('deploy/public should invoke copy with proper bucketname if public dir is not empty', t=> {
  t.plan(2)
  copyStub.resetHistory()
  copyStub.callsFake((bucket, shouldDelete, callback) => callback())
  var arc = Object.assign(base, {static:[['staging', 'stagingbucket'], ['production', 'prodbucket']]})
  let readStub = sinon.stub(fs, 'readdir').callsFake((path, callback) => callback(null, ['index.html']))
  deployPublic({ arc, env: '' }, () => {
    t.ok(copyStub.called, 'copy called')
    t.equals(copyStub.args[0][0], 'prodbucket', 'copy was passed proper bucket name parameter')
    readStub.restore()
    t.end()
  })
})
