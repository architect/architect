let arc = require('@architect/functions')

function route(req, res) {
  let request = JSON.stringify(req, null, 2)
  console.log(request)
  res({js:`console.log("hello world", ${request})`})
}

exports.handler = arc.js.get(route)
