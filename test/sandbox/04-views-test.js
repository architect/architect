var cp = require('fs').copyFileSync
var mkdir = require('mkdirp')
var test = require('tape')

test('setup', t => {
  t.plan(1)

  mkdir('test/sandbox/_mock')
  cp('test/sandbox/00-views-mock.arc', 'test/sandbox/_mock/.arc')

  mkdir('test/sandbox/_mock/src')
  mkdir('test/sandbox/_mock/src/js')
  mkdir('test/sandbox/_mock/src/html')
  mkdir('test/sandbox/_mock/src/js/get-000module')
  mkdir('test/sandbox/_mock/src/html/get-index')

  process.chdir('test/sandbox/_mock')
  t.ok(true, 'created test/_mock/.arc')
  console.log(process.cwd())
})
