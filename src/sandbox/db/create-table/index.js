var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var create = require('./_create-table')

module.exports = function _createTable(params, callback) {

  assert(params, {
    table: Object,
    app: String,
    indexes: Array,
  })

  var name = Object.keys(params.table)[0]
  var attr = params.table[name]
  var staging = `${params.app}-staging-${name}`
  var production = `${params.app}-production-${name}`

  parallel([
    function _createStaging(callback) {
      create(staging, attr, params.indexes, callback)
    },
    function _createProduction(callback) {
      create(production, attr, params.indexes, callback)
    }
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
