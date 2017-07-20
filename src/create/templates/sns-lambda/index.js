var arc = require('@smallwins/arc-prototype')

function handler(record, callback) {
  console.log(JSON.stringify(record), null, 2)
  callback()
}

exports.handler = arc.events.subscribe(handler)
