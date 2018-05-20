let arc = require('@architect/functions')

function route(req, res) {
  let request = JSON.stringify(req, null, 2)
  console.log(request)
  res({text:`this is plain text`})
}

exports.handler = arc.text.get(route)
