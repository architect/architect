var arc = require('@architect/functions')

function handler(record, callback) {
  console.log(JSON.stringify(record), null, 2)
  callback()
}

exports.handler = arc.tables.destroy(handler)
