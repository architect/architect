var arc = require('@architect/functions')

function route(req, res) {
  var str = JSON.stringify(req, null, 2)
  console.log(str)
  res({js:`console.log(${str})`})
}

exports.handler = arc.js(route)
