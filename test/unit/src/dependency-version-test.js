let test = require('tape')
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
