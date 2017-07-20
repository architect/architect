var arc = require('@smallwins/arc-prototype')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({
    json: {hello:'world'}
  })
}

exports.handler = arc.json.post(route)
