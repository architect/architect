var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var aws = require('aws-sdk')
var fs = require('fs')
var path = require('path')
let globStub = sinon.stub().callsFake((path, callback) => callback(null, []))
var copy = proxyquire('../../../../src/deploy/public/_copy-to-s3', {
  'glob': globStub
})

test('deploy/public/copy-to-s3 should put each globbed file under public not already present on S3 to S3', t=> {
  t.plan(4)
  var putStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    putObject: putStub,
    listObjectsV2: sinon.stub().callsFake((params, callback) => callback(null, {Contents:[]})),
    deleteObjects: sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[]})),
    headObject: sinon.stub().callsFake((params, callback) => callback({code:'NotFound'}))
  })
  globStub.resetBehavior()
  globStub.callsFake((filepath, callback) => callback(null, [path.join(process.cwd(), 'public', 'index.html')]))
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true,
    mtime: 2
  })
  sinon.stub(fs, 'readFileSync')
  copy('bukit', false/*shouldDelete*/, () => {
    fs.lstatSync.restore()
    t.ok(putStub.called, 's3.putObject called')
    var args = putStub.args[0][0]
    t.equals(args.Bucket, 'bukit', 's3.putObject called with proper bucket name')
    t.equals(args.Key, 'index.html', 's3.putObject called with proper key name using file name')
    t.equals(args.ContentType, 'text/html', 's3.putObject called with proper content type')
    fs.readFileSync.restore()
    aws.S3.restore()
    t.end()
  })
})

test('deploy/public/copy-to-s3 should delete files present on the bucket but not in the ./public/ folder', t=> {
  t.plan(3)
  var deleteStub = sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[{Key:'test.file'}]}))
  var listStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    putObject: sinon.stub().callsFake((params, callback) => callback()),
    listObjectsV2: listStub,
    deleteObjects: deleteStub,
    headObject: sinon.stub().callsFake((params, callback) => callback(null, {LastModified: 1}))
  })
  globStub.resetBehavior()
  var localFiles = [path.join(process.cwd(), 'public', 'index.html')]
  globStub.callsFake((filepath, callback) => callback(null, localFiles))
  listStub.callsFake((params, callback) => callback(null, {Contents:[{Key:'index.html'}, {Key:'test.file'}]}))
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true,
    mtime: 2
  })
  sinon.stub(fs, 'readFileSync')
  copy('bukit', true/*shouldDelete*/, () => {
    fs.lstatSync.restore()
    t.ok(deleteStub.called, 's3.deleteObjects called')
    var args = deleteStub.args[0][0]
    t.equals(args.Bucket, 'bukit', 's3.deleteObjects called with proper bucket name')
    t.equals(args.Delete.Objects[0].Key, 'test.file', 's3.deleteObjects called with proper key name using file name')
    fs.readFileSync.restore()
    aws.S3.restore()
    t.end()
  })
})

test('should not put objects if they were not modified', t=> {
  t.plan(1)
  var putStub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    putObject: putStub,
    listObjectsV2: sinon.stub().callsFake((params, callback) => callback(null, {Contents:[]})),
    deleteObjects: sinon.stub().callsFake((params, callback) => callback(null, {Deleted:[]})),
    headObject: sinon.stub().callsFake((params, callback) => callback(null, {LastModified: 1}))
  })
  globStub.resetBehavior()
  globStub.callsFake((filepath, callback) => callback(null, [path.join(process.cwd(), 'public', 'index.html')]))
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true,
    mtime: 0
  })
  sinon.stub(fs, 'readFileSync')
  copy('bukit', false/*shouldDelete*/, () => {
    fs.lstatSync.restore()
    t.ok(!putStub.called, 's3.putObject not called')
    fs.readFileSync.restore()
    aws.S3.restore()
    t.end()
  })
})
