let tiny = require('tiny-json-http')
let {exec} = require('child_process')
let aws = require('aws-sdk')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let rm = require('rimraf').sync
let mkdir = require('mkdirp').sync
let cp = require('fs').copyFileSync
let test = require('tape')
let pkg = require('../../../src/package/cli')

// FIXME we need an AWS account to run this against in CI
let Bucket = process.env.ARC_TEST_CF_BUCKET || 'cf-sam-deployments-east'
let StackName = 'TestApp'

// ensure theres no garbage from failed test runs
test('read info about the TestApp stack', t=> {
  t.plan(1)
  let cf = new aws.CloudFormation
  cf.describeStacks({StackName}, function done(err, result) {
    if (err && err.message === 'Stack with id TestApp does not exist') {
      t.ok(true, 'TestApp stack does not exist')
    }
    else if (err) t.fail(err)
    else if (result && result.Stacks && result.Stacks[0]) {
      cf.deleteStack({StackName}, function done(err) {
        if (err) t.fail(err)
        else {
          setTimeout(function wait() {
            t.ok(true, 'cleaned up old test stack')
          }, 1000 * 20)
        }
      })
    }
    else {
      t.fail('impossible result')
    }
  })
})

// create a hello world
test('setup .arc', t=> {
  t.plan(1)
  rm('test/_mock')
  mkdir('test/_mock')
  cp('test/slow/package/mock.arc', 'test/_mock/.arc')
  process.chdir('test/_mock')
  t.ok(true, 'created test/_mock/.arc')
  console.log(process.cwd())
})

// generate the code and sam.json from .arc
test('package .arc', t=> {
  t.plan(3)
  pkg(function done(err) {
    if (err) t.fail(err)
    else {
      let pathToSrc = path.join(process.cwd(), 'src')
      let pathToPublic = path.join(process.cwd(), 'public') 
      let pathToSam =  path.join(process.cwd(), 'sam.json')
      t.ok(fs.existsSync(pathToSrc), pathToSrc)
      t.ok(fs.existsSync(pathToPublic), pathToPublic)
      t.ok(fs.existsSync(pathToSam), pathToSam)
    }
  })
})

// verify the generated sam template
test('sam validate', t=> {
  t.plan(1)
  exec('sam validate -t sam.json', function done(err, stdout, stderr) {
    if (err) t.fail(err)
    else {
      t.ok(true, stdout)
    }
  })
})

// package the sam template into a cloudformation template
test('sam package', t=> {
  t.plan(1)
  exec(`sam package --template-file sam.json --output-template-file out.yaml --s3-bucket ${Bucket}`, function done(err, stdout, stderr) {
    if (err) t.fail(err)
    else {
      t.ok(true, stdout)
    }
  })
})

// deploy the cf template
test('sam deploy', t=> {
  t.plan(1)
  exec(`sam deploy --template-file out.yaml --stack-name TestApp --s3-bucket ${Bucket} --capabilities CAPABILITY_IAM`, function done(err, stdout, stderr) {
    if (err) t.fail(err)
    else {
      t.ok(true, stdout)
    }
  })
})

// get a 200 response from the deployed sam template
test('verify stack deployed correctly', t=> {
  t.plan(2)
  let cf = new aws.CloudFormation
  cf.describeStacks({StackName}, function done(err, result) {
    if (err) t.fail(err)
    else {
      let url = result.Stacks[0].Outputs.find(i=> i.OutputKey === 'ProductionURL').OutputValue
      t.ok(url, url)
      tiny.get({
        buffer: true,
        url
      },
      function done(err, result) {
        if (err) t.fail(err)
        else {
          t.ok(true, 'got result')
          console.log(result.body.toString())
        }
      })
    }
  })
})

// teardown the sam template
test('cleanup TestApp stack', t=> {
  t.plan(1)
  let cf = new aws.CloudFormation
  cf.deleteStack({StackName}, function done(err) {
    if (err) t.fail(err)
    else {
      setTimeout(function wait() {
        t.ok(true, 'clean')
      }, 1000*10)
    }
  })
})
