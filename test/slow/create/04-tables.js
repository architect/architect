let series = require('run-series')
let aws = require('aws-sdk')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let rm = require('rimraf').sync
let mkdir = require('mkdirp').sync
let cp = require('fs').copyFileSync
let test = require('tape')
let create = require('../../../src/create')
let inventory = require('../../../src/inventory')
let nuke = require('../../../src/inventory/nuke-tables')

/**
 * test/_mock/.arc
 */
test('@tables and @indexes setup', t=> {
  t.plan(1)
  mkdir('test/_mock')
  cp('test/slow/create/04-tables-mock.arc', 'test/_mock/.arc')
  process.chdir('test/_mock')
  t.ok(true, 'created test/_mock/.arc')
  console.log(process.cwd())
})

/**
 * runs create on test/_mock/.arc
 */
test('@tables and @indexes verify', t=> {
  t.plan(6)

  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)

  create(arc, raw, function _ran(err, plans) {
    if (err) t.fail(err)
    else {
      let db = new aws.DynamoDB
      db.listTables({}, function listTables(err, result) {
        if (err) t.fail(err)
        else {
          t.ok(result.TableNames.some(t=> t === 'testapp-production-data'), 'testapp-production-data')
          t.ok(result.TableNames.some(t=> t === 'testapp-production-posts'),'testapp-production-posts')
          t.ok(result.TableNames.some(t=> t === 'testapp-production-ppl'), 'testapp-production-ppl')
          t.ok(result.TableNames.some(t=> t === 'testapp-staging-data'), 'testapp-staging-data')
          t.ok(result.TableNames.some(t=> t === 'testapp-staging-posts'), 'testapp-staging-posts')
          t.ok(result.TableNames.some(t=> t === 'testapp-staging-ppl'), 'testapp-staging-ppl')
        }
      })
    }
  })
})

test('verify @tables and @indexes are active', t=> {
  t.plan(1)
  console.time('create')
  let db = new aws.DynamoDB
  series([
    'testapp-production-data',
    'testapp-production-posts',
    'testapp-production-ppl',
    'testapp-staging-data',
    'testapp-staging-posts',
    'testapp-staging-ppl',
  ].map(TableName=> {
    return function checkstatus(callback) {
      function check() {
        console.log('checking', TableName)
        db.describeTable({TableName}, function describeTable(err, result) {
          if (err) callback(err)
          else if (result && result.Table.TableStatus === 'ACTIVE') {
            let hasIndex = result.Table.GlobalSecondaryIndexes && Array.isArray(result.Table.GlobalSecondaryIndexes)
            if (hasIndex) {
              let indexes = result.Table.GlobalSecondaryIndexes
              let active = i=> i.IndexStatus === 'ACTIVE'
              let ready = indexes.filter(active).length === indexes.length
              if (ready) callback()
              else {
                // pause and retry
                setTimeout(function wait() {
                  check()
                }, 30*1000)
              }
            }
            else {
              callback()
            }
          }
          else {
            // pause and retry
            setTimeout(function wait() {
              check()
            }, 30*1000)
          }
        })
      }
      check()
    }
  }), 
  function done(err) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'tables and indexes ready')
      console.timeEnd('create')
    }
  })
})

/**
 * test inventory/nuke-tables
 */
test('@tables inventory/nuke', t=> {
  t.plan(2)
  let arcFile = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcFile).toString()
  let arc = parse(raw)
  inventory(arc, raw, function(err, result) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'got inventory')
      function done(err) {
        if (err && err.code === 'ResourceInUseException') {
          setTimeout(function waitmore() {
            nuke(result, done)
          }, 60*1000)
        }
        else if (err) t.fail(err)
        else t.ok(true, 'nuked inventory')
      }
      nuke(result, done)
    }
  })
})
