var arc = require('@architect/functions')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({location:`/`})
}

exports.handler = arc.html.post(route)
