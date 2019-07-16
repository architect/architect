let aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')
let proxyquire = require('proxyquire')
let sinon = require('sinon')
let test = require('tape')

let utils = {
  fingerprint: sinon.stub().callsFake((params, callback) => callback(null, {}))
}
let globStub = sinon.stub().callsFake((path, options, callback) => callback(null, []))
let publish = proxyquire('../../../../src/deploy/public/_publish-to-s3', {
  '@architect/utils': utils,
  'glob': globStub
})

let params = {
  Bucket: 'prodbucket',
  fingerprint: true,
  ignore: [],
  prune: false,
}

// Each unit test should follow the order of calls made in the SUT

test('Deploy/public should exit if public dir has no files to upload', t=> {
  t.plan(2)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [path.join(process.cwd(), 'public', 'readme.md')]))
  // S3 operations
  let headStub = sinon.stub().callsFake(({Bucket, Key}, callback) => callback(null, params))
  let putStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    headObject: headStub,
    putObject: putStub,
  })
  publish(params, () => {
    // Reset env for next test
    aws.S3.restore()

    t.ok(headStub.notCalled, 's3.headObject not called')
    t.ok(putStub.notCalled, 's3.putObject not called')
  })
})

test('Deploy/public uploads to S3, static.json manifest', t=> {
  /**
   * Note: prior to moving fingerprinting to @architect/utils, it was tested here
   * While this test assumes fingerprinting is itself tested and working properly, it does test its effects (such as the presence of caching headers, etc.)
   */
  t.plan(4)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'readme.md'),
    path.join(process.cwd(), 'public', 'styles.css'),
  ]))
  utils.fingerprint.resetBehavior()
  utils.fingerprint.callsFake((params, callback) => callback(null, {
    'index.html': 'index-df330f3f12.html',
    'styles.css': 'styles-df330f3f12.css'
  }))
  // S3 operations
  sinon.stub(fs, 'lstatSync').returns({
    mtime: 2
  })
  let headStub = sinon.stub().callsFake(({Bucket, Key}, callback) => callback(null, params))
  let putStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(fs, 'readFileSync')
  sinon.stub(aws, 'S3').returns({
    headObject: headStub,
    putObject: putStub,
    listObjectsV2: sinon.stub().callsFake((params, callback) => callback(null, {Contents:[]})),
    deleteObjects: sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[]})),
  })
  publish(params, () => {
    // Reset env for next test
    fs.lstatSync.restore()
    fs.readFileSync.restore()
    aws.S3.restore()

    t.ok(headStub.calledThrice, 'Correct number of s3.headObject reqs made')
    t.ok(putStub.calledThrice, 'Correct number of s3.putObject reqs made')
    t.equals(putStub.args[0][0].CacheControl, 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0', 'static.json anti-caching headers set')
    t.equals(putStub.args[1][0].CacheControl, 'max-age=315360000', 'Fingerprinted cache-control headers set')
  })
})

test('Deploy/public should prune files present in the bucket but not in public/', t=> {
  t.plan(4)
  // Alter params
  params.fingerprint = false
  params.prune = true
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'readme.md'),
  ]))
  // Static manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {callback()})
  // S3 operations
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true,
    mtime: 2
  })
  sinon.stub(fs, 'readFileSync')
  let listStub = sinon.stub().callsFake((params, callback) => callback(null, {Contents:[{Key:'index.html'}, {Key:'test.file'}]}))
  let deleteStub = sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[{Key:'test.file'}]}))
  sinon.stub(aws, 'S3').returns({
    headObject: sinon.stub().callsFake((params, callback) => callback(null, {LastModified: 1})),
    putObject: sinon.stub().callsFake((params, callback) => callback()),
    listObjectsV2: listStub,
    deleteObjects: deleteStub,
  })
  publish(params, () => {
    // Reset env for next test
    fs.writeFile.restore()
    fs.lstatSync.restore()
    fs.readFileSync.restore()
    aws.S3.restore()
    params.fingerprint = true
    params.prune = false

    let args = deleteStub.args[0][0]
    t.ok(listStub.called, 'S3.listStub called')
    t.ok(deleteStub.called, 'S3.deleteObjects called')
    t.equals(args.Delete.Objects[0].Key, 'test.file', 's3.deleteObjects called with proper key name using file name')
    t.equals(args.Delete.Objects.length, 1, 's3.deleteObjects deleted correct number of files')
  })
})

test('Deploy/public should prune files present in the bucket but not in public/', t=> {
  t.plan(1)
  // Globbing
  globStub.resetBehavior()
  globStub.callsFake((filepath, options, callback) => callback(null, [
    path.join(process.cwd(), 'public', 'index.html'),
  ]))
  // Static manifest
  let fsStub = sinon.stub(fs, 'writeFile').callsFake((dest, data, callback) => {callback()})
  // S3 operations
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true,
    mtime: 0
  })
  let putStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    headObject: sinon.stub().callsFake((params, callback) => callback(null, {LastModified: 1})),
    putObject: putStub,
    listObjectsV2: sinon.stub().callsFake((params, callback) => callback(null, {Contents:[]})),
    deleteObjects: sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[]})),
  })
  publish(params, () => {
    // Reset env for next test
    fs.writeFile.restore()
    fs.lstatSync.restore()
    aws.S3.restore()

    t.ok(!putStub.called, 's3.putObject not called')
  })
})
