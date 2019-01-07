// One-off / special case for directly accessing NPM operator
let npm = require('../../hydrate/providers/npm')
let copyCommon = require('../../hydrate/shared/_copy')

// TODO in the future we will need to make this function runtime (and package manager) independent

module.exports = function _installFunctionsAndData(params, callback) {
  let { absolutePath, relativePath, arc } = params
  let pathToCode = relativePath.split()
  // Must be npm i and not npm ci; at this moment the Function dir does not have a package-lock.json file
  npm([[absolutePath, ['i', '@architect/functions', '@architect/data', '--ignore-scripts']]], function _done(err) {
    if (err) callback(err)
    else copyCommon({arc, pathToCode}, callback)
  })
}
