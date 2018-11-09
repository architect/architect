var test = require('tape')
var proxyquire = require('proxyquire')
var sinon = require('sinon')
var aws = require('aws-sdk')
var fs = require('fs')
var path = require('path')
let globStub = sinon.stub().callsFake((path, callback) => callback(null, []))
var copy = proxyquire('../../../src/deploy/public/_copy-to-s3', {
  'glob': globStub
})

test('deploy/public/copy-to-s3 should put each globbed file under public as an object to s3', t=> {
  t.plan(4)
  var s3Stub = sinon.stub().callsFake((params, callback) => callback())
  sinon.stub(aws, 'S3').returns({
    putObject: s3Stub
  })
  globStub.resetBehavior()
  globStub.callsFake((filepath, callback) => callback(null, [path.join(process.cwd(), 'public', 'index.html')]))
  sinon.stub(fs, 'lstatSync').returns({
    isDirectory: () => false,
    isFile: () => true
  })
  sinon.stub(fs, 'readFileSync')
  copy('bukit', () => {
    fs.lstatSync.restore()
    t.ok(s3Stub.called, 's3.putObject called')
    var args = s3Stub.args[0][0]
    t.equals(args.Bucket, 'bukit', 's3.putObject called with proper bucket name')
    t.equals(args.Key, 'index.html', 's3.putObject called with proper key name using file name')
    t.equals(args.ContentType, 'text/html', 's3.putObject called with proper content type')
    fs.readFileSync.restore()
    aws.S3.restore()
    t.end()
  })
})
