let arc = require('@architect/functions')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({
    json: {msg:'hello world from patch'}
  })
}

exports.handler = arc.json.patch(route)
