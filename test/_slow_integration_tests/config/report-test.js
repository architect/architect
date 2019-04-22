let aws = require('aws-sdk')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let rm = require('rimraf').sync
let mkdir = require('mkdirp').sync
let cp = require('fs').copyFileSync
let test = require('tape')

test('config setup', t=> {
  t.plan(1)
  mkdir('test/config/_mock')
  cp('test/_slow_integration_tests/config/mock.arc', 'test/config/_mock/.arc')
  process.chdir('test/config/_mock')
  t.ok(true, 'created test/config/_mock/.arc')
  console.log(process.cwd())
})

test('config report', t=> {
  t.plan(1)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  t.ok(true, 'got arc')
  console.log(arc)
})

// create local
// copy in arc-config mocks
// run report
