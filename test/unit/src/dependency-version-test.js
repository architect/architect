let test = require('tape')
let { join } = require('path')
let package = require('../../../package.json')

let deps = Object.keys(package.dependencies)

test('All primary dependencies must be version locked', t => {
  t.plan(deps.length)
  deps.forEach(dep => {
    let ver = package.dependencies[dep]
    let valid = !ver.startsWith('~') &&
                !ver.startsWith('^') &&
                !ver.toLowerCase().includes('x') &&
                !ver.includes('*')
    if (valid)
      t.pass(`${dep} version is ok: ${ver}`)
    else
      t.fail(`${dep} must be version-locked in package.json: ${ver}`)
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
      // eslint-disable-next-line
      let pkg = require(join(process.cwd(), 'node_modules', dep, 'package.json'))
      let subDeps = Object.keys(pkg.dependencies)
      subDeps.forEach(dep => {
        let ver = pkg.dependencies[dep]
        let valid = ver.startsWith('~') ||
                    ver.match(/^\d/)
        if (!valid)
          t.fail(`${pkg.name} must have ${dep} set to ~ (or pinned) in package.json: ${ver}`)
      })
      t.pass(`${dep}'s owned subdependency versions are ok: ~`)
    }
  })
})
