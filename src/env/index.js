let parse = require('@architect/parser')
let join = require('path').join
let all = require('./_all')
let write = x=> !x // FIXME impl
let remove = x=> !x // FIXME impl

function read(callback) {
  let raw = join(process.cwd(), '.arc')
  let arc = parse(raw)
  let app = arc.app[0]
  all(app, callback)
}

module.exports = {read, write, remove}
