let test = require('tape')
let { join } = require('path')
let package = require('../../../package.json')
let utilityDeps = [ '@architect/inventory', '@architect/utils' ]
let isAwsLite = dep => dep.startsWith('@aws-lite/')

let startsWithNumber = /^\d/
let deps = Object.keys(package.dependencies)

test('All primary dependencies must be version locked', t => {
  t.plan(deps.length)
  deps.forEach(dep => {
    let ver = package.dependencies[dep]
    if (ver.toLowerCase().includes('x') || ver.includes('*')) {
      t.fail(`${dep} has invalid version in package.json: ${ver}`)
    }
    else if (utilityDeps.includes(dep)) {
      t.ok(ver.startsWith('~'), `${dep} version is ok: ${ver}`)
    }
    else if (isAwsLite(dep)) {
      t.ok(ver.startsWith('^'), `${dep} version is ok: ${ver}`)
    }
    else if (ver.match(startsWithNumber)) {
      console.log('made it here?')
      t.pass(`${dep} version is ok: ${ver}`)
    }
    else {
      t.fail(`${dep} version issue: ${ver}`)
    }
  })
})

test('All secondary dependencies of owned libraries must be semver ~ or pinned', t => {
  let plan = 0
  for (let dep of deps) {
    if (dep.startsWith('@architect/')) ++plan
  }
  t.plan(plan)
  deps.forEach(dep => {
    if (dep.startsWith('@architect/')) {
      let pkg = require(join(process.cwd(), 'node_modules', dep, 'package.json'))
      let subDeps = Object.keys(pkg.dependencies)
      subDeps.forEach(dep => {
        let ver = pkg.dependencies[dep]
        let valid = isAwsLite(dep)
          ? ver.startsWith('^')
          : ver.startsWith('~') || ver.match(startsWithNumber)
        if (!valid) {
          t.fail(`${pkg.name} must have ${dep} semver correctly set in package.json: ${ver}`)
        }
      })
      t.pass(`${dep}'s owned subdependency versions are ok`)
    }
  })
})
