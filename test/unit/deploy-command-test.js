let test = require('tape')
let sinon = require('sinon')
let deploy = require('@architect/deploy')
let utils = require('@architect/utils')
let deployCmd = require('../../src/commands/deploy')

test('deploy command invokes deploy.dirty if specified via options', async t => {
  let opts = ['dirty', '--dirty', '-d']
  t.plan(opts.length * 2) // ensuring dirty is called, and sam is not, per opt
  let fakeDirty = sinon.fake.resolves()
  let fakeSam = sinon.fake.resolves()
  let fakeRead = sinon.fake.returns({
    arc: {aws: [['bucket']]}
  })
  sinon.replace(deploy, 'dirty', fakeDirty)
  sinon.replace(deploy, 'sam', fakeSam)
  sinon.replace(utils, 'readArc', fakeRead)
  opts.forEach(async (opt) => {
    fakeDirty.resetHistory()
    fakeSam.resetHistory()
    try {
      await deployCmd([opt])
      t.ok(fakeDirty.calledOnce, `${opt} invoked deploy.dirty`)
      t.notOk(fakeSam.calledOnce, `${opt} did not invoke deploy.sam`)
    } catch (e) {
      t.fail(e)
    }
  })
  sinon.restore()
})

test('deploy command invokes deploy.static if specified via options', async t => {
  let opts = ['static', '--static', '-s']
  t.plan(opts.length * 2) // ensuring static is called, and sam is not, per opt
  let fakeStatic = sinon.fake.resolves()
  let fakeSam = sinon.fake.resolves()
  let fakeRead = sinon.fake.returns({
    arc: {aws: [['bucket']]}
  })
  sinon.replace(deploy, 'static', fakeStatic)
  sinon.replace(deploy, 'sam', fakeSam)
  sinon.replace(utils, 'readArc', fakeRead)
  opts.forEach(async (opt) => {
    fakeStatic.resetHistory()
    fakeSam.resetHistory()
    try {
      await deployCmd([opt])
      t.ok(fakeStatic.calledOnce, `${opt} invoked deploy.static`)
      t.notOk(fakeSam.calledOnce, `${opt} did not invoke deploy.sam`)
    } catch (e) {
      t.fail(e)
    }
  })
  sinon.restore()
})

test('deploy command invokes deploy.sam by default', async t => {
  t.plan(1)
  let fakeSam = sinon.fake.resolves()
  let fakeRead = sinon.fake.returns({
    arc: {aws: [['bucket']]}
  })
  sinon.replace(deploy, 'sam', fakeSam)
  sinon.replace(utils, 'readArc', fakeRead)
  try {
    await deployCmd()
    t.ok(fakeSam.calledOnce, `lack of options invoked deploy.sam`)
  } catch (e) {
    t.fail(e)
  }
  sinon.restore()
})
