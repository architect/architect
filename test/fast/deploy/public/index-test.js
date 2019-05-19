let test = require('tape')
let proxyquire = require('proxyquire')
let fs = require('fs')
let mkdir = require('mkdirp')
let pathExists = require('path-exists')
let sinon = require('sinon')
let mkdirStub = sinon.stub(mkdir, 'sync')
let pathExistsStub = sinon.stub(pathExists, 'sync')
let publishStub = sinon.stub().callsFake(({Bucket, fingerprinting, ignore, deleteOrphans}, callback) => {callback()})

let deployPublic = proxyquire('../../../../src/deploy/public', {'./_publish-to-s3': publishStub})

let arc = {
  appname: ['testapp'],
  static: [
    ['staging', 'stagingbucket'],
    ['production', 'prodbucket']
  ]
}

test('Deploy/public should bail if arc is missing @static pragma', t=> {
  t.plan(1)
  deployPublic({ arc: {appname: ['testapp']}, env: '' }, () => {
    t.ok(!mkdirStub.called, 'mkdir not called')
    t.end()
  })
})

test('Deploy/public should make a public dir if arc specifies @static pragma', t=> {
  t.plan(2)
  pathExistsStub = pathExistsStub.returns(false)
  deployPublic({ arc, env: '' }, () => {
    t.ok(pathExistsStub.called, 'path-exists called')
    t.ok(mkdirStub.called, 'mkdir called')
    t.end()
  })
})

test('Fingerprinting should be enabled by default', t=> {
  t.plan(3)
  sinon.resetHistory()
  deployPublic({ arc, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprinting, true, 'Fingerprinting enabled by default')
  })

  sinon.resetHistory()
  let fingerprintingOn = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  fingerprintingOn.static.push(["fingerprinting", true])
  deployPublic({ arc: fingerprintingOn, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprinting, true, 'Fingerprinting explicitly enabled')
  })

  sinon.resetHistory()
  let fingerprintingOff = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  fingerprintingOff.static.push(["fingerprinting", false])
  deployPublic({ arc: fingerprintingOff, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprinting, false, 'Fingerprinting explicitly disabled')
    t.end()
  })
})


test('Orphaned file deletion should be disabled by default', t=> {
  t.plan(3)
  sinon.resetHistory()
  deployPublic({ arc, env: '' }, () => {
    t.equals(publishStub.args[0][0].deleteOrphans, false, 'Orphaned file deletion disabled by default')
  })

  sinon.resetHistory()
  let deleteOrphansOn = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  deleteOrphansOn.static.push(["deleteOrphans", true])
  deployPublic({ arc: deleteOrphansOn, env: '' }, () => {
    t.equals(publishStub.args[0][0].deleteOrphans, true, 'Orphaned file deletion explicitly enabled')
  })

  sinon.resetHistory()
  let deleteOrphansOff = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  deleteOrphansOff.static.push(["deleteOrphans", false])
  deployPublic({ arc: deleteOrphansOff, env: '' }, () => {
    t.equals(publishStub.args[0][0].deleteOrphans, false, 'Orphaned file deletion explicitly disabled')
    t.end()
  })
})

test('Deploy/public should invoke publish with proper params and defaults', t=> {
  t.plan(5)
  deployPublic({ arc, env: '' }, () => {
    t.ok(publishStub.called, 'publish called')
    t.equals(publishStub.args[0][0].Bucket, 'prodbucket', 'Proper bucket name found')
    t.equals(publishStub.args[0][0].fingerprinting, true, 'Fingerprinting default enabled')
    t.ok(publishStub.args[0][0].ignore, 'No ignored files found')
    t.equals(publishStub.args[0][0].deleteOrphans, false, 'Orphan deletion default disabled')
    t.end()
  })
})
