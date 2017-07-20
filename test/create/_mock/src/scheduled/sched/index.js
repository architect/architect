var arc = require('@smallwins/arc-prototype')

function handler(event, callback) {
  console.log(JSON.stringify(event), null, 2)
  callback()
}

exports.handler = arc.scheduled(handler)
