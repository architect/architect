let arc = require('@architect/functions')

let css = `
body {
  background: blue;
}
`

function route(req, res) {
  console.log(JSON.stringify(req, null, 2))
  res({css})
}

exports.handler = arc.css.get(route)
