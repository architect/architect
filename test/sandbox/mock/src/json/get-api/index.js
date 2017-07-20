var arc = require('@smallwins/arc-prototype')

function index(req, res) {
  res({
    json: {
      hello: 'world', 
      envs: process.env
    }
  })
}

exports.handler = arc.json.get(index)
