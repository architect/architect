let arc = require('@architect/functions')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({
    json: {msg:'hello world from put'}
  })
}

exports.handler = arc.json.put(route)
