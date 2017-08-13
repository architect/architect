var arc = require('@architect/functions')

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({css:`body {background:green;}`})
}

exports.handler = arc.css(route)
