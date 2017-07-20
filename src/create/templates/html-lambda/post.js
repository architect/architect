var arc = require('@smallwins/arc-prototype')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({location:`/`})
}

exports.handler = arc.html.post(route)
