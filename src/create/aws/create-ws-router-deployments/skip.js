var print = require('../../_print')

module.exports = function skip(params, callback) {
  print.skip('@ws', `${params.name}-ws-${params.env}`)
  callback()
}
