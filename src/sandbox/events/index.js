let readArc = require('../../util/read-arc')
let fork = require('child_process').fork
let path = require('path')
let http = require('http')
let chalk = require('chalk')

module.exports = {start}

/**
 * creates a little web server that listens for events on 3334
 */
function start(callback) {

  let {arc} = readArc()
  let close = x=> !x

  // if .arc has events and we're not clobbering with ARC_LOCAL flag
  if (arc.events) {
    // start a little web server
    let server = http.createServer(function listener(req, res) {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {
        console.log(chalk.grey.dim('@event'), chalk.green.dim(JSON.stringify(JSON.parse(body), null, 2)))
        // spawn a fork of the node process
        let subprocess = fork(path.join(__dirname, '_subprocess.js'))
        subprocess.send(JSON.parse(body))
        subprocess.on('message', function _message(msg) {
          console.log(chalk.grey.dim(msg.text))
        })
        res.statusCode = 200
        res.end('ok')
      })
    })
    // ends our little web server
    close = function _closer() {
      try {
        server.close()
      }
      catch(e) {
        console.log('swallowing server.close error in sandbox events', e)
      }
    }
    // start listening on 3334
    server.listen(3334, callback ? callback: x=>!x)
  }
  else {
    callback()
  }
  return {close}
}
