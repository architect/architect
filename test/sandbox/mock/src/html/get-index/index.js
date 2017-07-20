var arc = require('@smallwins/arc-prototype')

function index(req, res) {
  res({
    html: 'hello world'
  })
}

exports.handler = arc.html.get(index)
