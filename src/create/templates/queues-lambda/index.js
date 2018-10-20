let arc = require('@architect/functions')

function handler(record, callback) {
  if (process.env.NODE_ENV !== 'production') console.log(JSON.stringify(record, null, 2))
  callback()
}

exports.handler = arc.queues.subscribe(handler)
