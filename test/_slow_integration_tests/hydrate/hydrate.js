let cp = require('cpr')
let exists = require('path-exists').sync
let fs = require('fs')
let mkdir = require('mkdirp').sync
let parallel = require('run-parallel')
let rm = require('rimraf')
let test = require('tape')

let getName = require('../../../src/util/get-lambda-name')
let hydrate = require('../../../src/hydrate')
let inventory = require('../../../src/inventory')
let readArc = require('../../../src/util/read-arc')
let sharedCopy = require('../../../src/hydrate/shared/_copy')
let arc
let pathToCode
let indexPath = 'src/http/get-index/'

/**
 * Tests a 9 Function arc project
 * - 9 Functions because 1 of each fn type + additional 1 of each http type
 * - makes it a little more deterministic when testing src/shared + src/views
 */

// Setup
test('Test env', t=> {
  t.ok(getName, 'getName exists')
  t.ok(hydrate, 'hydrate exists')
  t.ok(inventory, 'inventory exists')
  t.ok(readArc, 'readArc exists')
  t.ok(sharedCopy, 'sharedCopy exists')
  t.end()
})

test('Setup folder', t=> {
  t.plan(1)
  process.chdir('mock')
  mkdir('tmp')
  cp('app', 'tmp', {overwrite:true},
  function done(err){
    if (err) t.fail(err)
    else {
      let created = exists('tmp/.arc')
      t.ok(created, 'mock app exists')
    }
  })
})

test('Load project', t=> {
  t.plan(1)
  process.chdir('tmp')
  let parsed = readArc()
  arc = parsed.arc
  inventory(arc, null, function _arc(err, result) {
    if (err) t.fail(err)
    else {
      pathToCode = result.localPaths
      t.ok(arc, 'mock app inventory loaded')
    }
  })
})

// Destroys all node_modules dirs to cleanly start the next test without rebuilding the folder
function destroyNodeModules(t) {
  rm('**/node_modules', function done(err) {
    if (err) t.fail(err)
    else t.notOk(exists(indexPath + 'node_modules'))
  })
}

// Folder rebuilder
// For when you really, truly need to completely reset the state of the test app
// (Only really needed for failure cases where files are moved or destroyed)
function rebuildFolder(t) {
  process.chdir('..')
  rm('tmp', function done(err) {
    if (err) {
      t.fail(err)
    }
    else if (exists('tmp/.arc')) {
      t.fail('did not delete mock app during rebuild')
    }
    else {
      mkdir('tmp')
      cp('app', 'tmp', {overwrite:true},
      function done(err){
        if (err) {
          t.fail(err)
        }
        else {
          process.chdir('tmp')
          let created = exists('.arc')
          t.ok(created, 'mock app restored')
        }
      })
    }
  })
}

/**
 * Let the testing begin!
 */

// hydrate.install() tests
test('Install all Functions\' dependencies (basic)', t=> {
  t.plan(2)
  hydrate.install({
    arc,
    pathToCode
  },
  function done(err) {
    if (err) t.fail(err)
    else {
      // Check to see if files that are supposed to be there are actually there
      parallel(pathToCode.map(path=> {
        return function _exists(callback) {
          let tiny = exists(path + '/node_modules/tiny-json-http/package.json')
          let dotArc = exists(path + '/node_modules/@architect/shared/.arc')
          if (!tiny || !dotArc) {
            callback(new Error(`file missing in ${path}`))
          }
          else callback()
        }
      }),
      function _done(err) {
        if (err) t.fail(err)
        else {
          t.ok(true, 'All dependencies installed')
          destroyNodeModules(t)
        }
      })
    }
  })
})

test('Install all Functions\' dependencies (src/shared + src/views)', t=> {
  t.plan(2)
  cp('_optional', 'src', {overwrite: true},
  function done(err) {
    if (err) t.fail(err)
    else {
      // Deep copy project without views
      let noViews = Object.assign({}, arc)
      delete noViews.views
      hydrate.install({
        arc: noViews,
        pathToCode
      },
      function done(err) {
        if (err) t.fail(err)
        else {
          // Check to see if files that are supposed to be there are actually there
          parallel(pathToCode.map(path=> {
            return function _exists(callback) {
              let tiny = exists(path + '/node_modules/tiny-json-http/package.json')
              let dotArc = exists(path + '/node_modules/@architect/shared/.arc')
              let shared = exists(path + '/node_modules/@architect/shared/shared.md')
              // Search for views in all GET routes
              let views
              let pattern = path.startsWith('src/http/get-')
              if (pattern) views = exists(path + '/node_modules/@architect/views/views.md')
              // Search for the lack of views in non-GET routes
              else if (!pattern) views = !exists(path + '/node_modules/@architect/views/views.md')
              if (!tiny || !dotArc || !shared || !views) {
                callback(new Error(`file missing in ${path}`))
              }
              else callback()
            }
          }),
          function _done(err) {
            if (err) t.fail(err)
            else {
              t.ok(true, 'All dependencies installed')
              destroyNodeModules(t)
            }
          })
        }
      })
    }
  })
})

test('Install all Functions\' dependencies (src/shared + @views section)', t=> {
  t.plan(2)
  cp('_optional', 'src', {overwrite: true},
  function done(err) {
    if (err) t.fail(err)
    else {
      // Deep copy project without views
      let noViews = Object.assign({}, arc)
      delete noViews.views
      hydrate.install({
        arc,
        pathToCode
      },
      function done(err) {
        if (err) t.fail(err)
        else {
          // Convert parsed @views to inventory report localPaths format
          let routes = []
          arc.views.forEach(item => routes.push('src/http/' + item[0] + getName(item[1])))
          // Check to see if files that are supposed to be there are actually there
          parallel(pathToCode.map(path=> {
            return function _exists(callback) {
              let tiny = exists(path + '/node_modules/tiny-json-http/package.json')
              let dotArc = exists(path + '/node_modules/@architect/shared/.arc')
              let shared = exists(path + '/node_modules/@architect/shared/shared.md')
              // Search for views in all @views routes
              let views
              let pattern = routes.includes(path)
              if (pattern) views = exists(path + '/node_modules/@architect/views/views.md')
              // Search for the lack of views in non-@views routes
              else if (!pattern) views = !exists(path + '/node_modules/@architect/views/views.md')
              if (!tiny || !dotArc || !shared || !views) {
                callback(new Error(`file missing in ${path}`))
              }
              else callback()
            }
          }),
          function _done(err) {
            if (err) t.fail(err)
            else {
              t.ok(true, 'All dependencies installed')
              destroyNodeModules(t)
            }
          })
        }
      })
    }
  })
})

// hydrate.update() tests
// TODO running update should result in node_modules being installed; this approach will suffice for now, but a better way to test would decrement dep version values in package-lock.json files, and then check those versions
test('Update all Functions\' dependencies', t=> {
  t.plan(2)
  hydrate.update({
    arc,
    pathToCode
  },
  function done(err) {
    if (err) t.fail(err)
    else {
      // Check to see if files that are supposed to be there are actually there
      parallel(pathToCode.map(path=> {
        return function _exists(callback) {
          let tiny = exists(path + '/node_modules/tiny-json-http/package.json')
          let dotArc = exists(path + '/node_modules/@architect/shared/.arc')
          if (!tiny || !dotArc) {
            callback(new Error(`file missing in ${path}`))
          }
          else callback()
        }
      }),
      function _done(err) {
        if (err) t.fail(err)
        else {
          t.ok(true, 'All dependencies updated')
          destroyNodeModules(t)
        }
      })
    }
  })
})

// hydrate.shared() tests
test('Install shared dependencies (shared + views)', t=> {

  t.plan(2)
  cp('_optional', 'src', {overwrite: true},
  function done(err) {
    if (err) t.fail(err)
    else {
      hydrate.shared({
        installing: true,
        arc,
        pathToCode,
      },
      function done(err) {
        if (err) t.fail(err)
        else {
          // Check to see if files that are supposed to be there are actually there
          // No need to check in individual Functions if tests didn't fail up to this point
          let shared = exists('src/shared/node_modules/tiny-json-http/package.json')
          let views = exists('src/views/node_modules/tiny-json-http/package.json')
          if (!shared || !views) {
            t.fail(new Error(`file missing in shared and/or views`))
          }
          else {
            t.ok(true, 'All dependencies installed')
            destroyNodeModules(t)
          }
        }
      })
    }
  })
})

test('Update shared dependencies (shared + views)', t=> {
  t.plan(2)
  cp('_optional', 'src', {overwrite: true},
  function done(err) {
    if (err) t.fail(err)
    else {
      hydrate.shared({
        installing: false,
        arc,
        pathToCode
      },
      function done(err) {
        if (err) t.fail(err)
        else {
          // Check to see if files that are supposed to be there are actually there
          // No need to check in individual Functions if tests didn't fail up to this point
          let shared = exists('src/shared/node_modules/tiny-json-http/package.json')
          let views = exists('src/views/node_modules/tiny-json-http/package.json')
          if (!shared || !views) {
            t.fail(new Error(`file missing in shared and/or views`))
          }
          else {
            t.ok(true, 'All dependencies installed')
            destroyNodeModules(t)
          }
        }
      })
    }
  })
})

// Shared file copier (hydrate/shared/_copy)
// Called by create, hydrate, and sandbox
test('Shared file copier copies shared files into file folders', t=> {
  t.plan(2)
  cp('_optional', 'src', {overwrite: true},
  function done(err) {
    if (err) t.fail(err)
    else {
      sharedCopy({
        arc,
        pathToCode: [indexPath] // Testing a single file is sufficient
      },
      function done(err) {
        if (err) t.fail(err)
        else {
          // Check to see if files that are supposed to be there are actually there
          let shared = exists(indexPath + 'node_modules/@architect/shared/shared.md')
          // let views = exists(indexPath + 'node_modules/@architect/views/views.md')
          let dotArc = exists(indexPath + 'node_modules/@architect/shared/.arc')
          if (!shared || !dotArc) {
            t.fail(new Error(`file missing in ${indexPath}`))
          }
          else {
            t.ok(true, 'Shared  installed')
            destroyNodeModules(t)
          }
        }
      })
    }
  })
})

// Fail state tests
// - Failing hydration will fail a deploy!
// - Remember: fully restore the state of files after each test
test('Missing package.json fails hydration', t=> {
  t.plan(2)
  // Make missing the package file
  fs.renameSync(indexPath + 'package.json', indexPath + 'package.bak')
  hydrate.install({
    arc,
    pathToCode
  },
  function done(err) {
    if (err) {
      t.ok(true, `Successfully exited 1 with ${err}...`)
      rebuildFolder(t)
    }
    else t.fail('Hydration did not fail')
  })
})

test('Missing package-lock.json fails hydration', t=> {
  t.plan(2)
  // Make missing the package-lock file
  fs.renameSync(indexPath + 'package-lock.json', indexPath + 'package-lock.bak')
  hydrate.install({
    arc,
    pathToCode
  },
  function done(err) {
    if (err) {
      t.ok(true, `Successfully exited 1 with ${err}...`)
      rebuildFolder(t)
    }
    else t.fail('Hydration did not fail')
  })
})

test('Corrupt package-lock.json fails hydration', t=> {
  t.plan(2)
  // Make missing the package-lock file
  fs.renameSync(indexPath + 'package-lock.json', indexPath + 'package-lock.bak')
  let corruptPackage = 'ohayo gozaimasu!'
  fs.writeFileSync('src/http/get-index/package-lock.json', corruptPackage)
  hydrate.install({
    arc,
    pathToCode,
  },
  function done(err) {
    if (err) {
      t.ok(true, `Successfully exited 1 with ${err}...`)
      rebuildFolder(t)
    }
    else t.fail('Hydration did not fail')
  })
})

test('Corrupt package.json fails hydration', t=> {
  t.plan(2)
  // Make missing the package file
  fs.renameSync(indexPath + 'package.json', indexPath + 'package.bak')
  let corruptPackage = 'ohayo gozaimasu!'
  fs.writeFileSync('src/http/get-index/package.json', corruptPackage)
  hydrate.install({
    arc,
    pathToCode
  },
  function done(err) {
    if (err) {
      t.ok(true, `Successfully exited 1 with ${err}...`)
      rebuildFolder(t)
    }
    else t.fail('Hydration did not fail')
  })
})

// Teardown
test('Teardown', t=> {
  t.plan(1)
  process.chdir('..')
  rm('tmp',
  function done(err) {
    if (err) t.fail(err)
    else {
      let destroyed = exists('mock/tmp')
      t.notOk(destroyed, 'mock app destroyed')
    }
  })
})
