let readArc = require('../util/read-arc')
let all = require('./_all')

function read(callback) {
  let {arc} = readArc()
  let app = arc.app[0]
  all(app, callback)
}

module.exports = {read}
