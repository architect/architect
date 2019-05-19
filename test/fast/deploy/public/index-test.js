let fs = require('fs')
let mkdir = require('mkdirp')
let proxyquire = require('proxyquire')
let sinon = require('sinon')
let test = require('tape')
let mkdirStub = sinon.stub(mkdir, 'sync')
let publishStub = sinon.stub().callsFake(({Bucket, fingerprint, ignore, prune}, callback) => {callback()})

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
  t.plan(1)
  deployPublic({ arc, env: '' }, () => {
    t.ok(mkdirStub.called, 'mkdir called')
    t.end()
  })
})

test('Fingerprinting should be enabled by default', t=> {
  t.plan(3)
  sinon.resetHistory()
  deployPublic({ arc, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprint, true, 'Fingerprinting enabled by default')
  })

  sinon.resetHistory()
  let fingerprintEnabled = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  fingerprintEnabled.static.push(["fingerprint", true])
  deployPublic({ arc: fingerprintEnabled, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprint, true, 'Fingerprinting explicitly enabled')
  })

  sinon.resetHistory()
  let fingerprintDisabled = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  fingerprintDisabled.static.push(["fingerprint", false])
  deployPublic({ arc: fingerprintDisabled, env: '' }, () => {
    t.equals(publishStub.args[0][0].fingerprint, false, 'Fingerprinting explicitly disabled')
    t.end()
  })
})


test('Orphaned file deletion should be disabled by default', t=> {
  t.plan(3)
  sinon.resetHistory()
  deployPublic({ arc, env: '' }, () => {
    t.equals(publishStub.args[0][0].prune, false, 'Orphaned file deletion disabled by default')
  })

  sinon.resetHistory()
  let pruneEnabled = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  pruneEnabled.static.push(["prune", true])
  deployPublic({ arc: pruneEnabled, env: '' }, () => {
    t.equals(publishStub.args[0][0].prune, true, 'Orphaned file deletion explicitly enabled')
  })

  sinon.resetHistory()
  let pruneDisabled = JSON.parse(JSON.stringify(arc)) // Deep clone for mutation
  pruneDisabled.static.push(["prune", false])
  deployPublic({ arc: pruneDisabled, env: '' }, () => {
    t.equals(publishStub.args[0][0].prune, false, 'Orphaned file deletion explicitly disabled')
    t.end()
  })
})

test('Deploy/public should invoke publish with proper params and defaults', t=> {
  t.plan(5)
  deployPublic({ arc, env: '' }, () => {
    t.ok(publishStub.called, 'publish called')
    t.equals(publishStub.args[0][0].Bucket, 'prodbucket', 'Proper bucket name found')
    t.equals(publishStub.args[0][0].fingerprint, true, 'Fingerprinting default enabled')
    t.ok(publishStub.args[0][0].ignore, 'No ignored files found')
    t.equals(publishStub.args[0][0].prune, false, 'Orphan deletion default disabled')
    t.end()
  })
})
