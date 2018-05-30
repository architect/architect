let parse = require('@architect/parser')
let fork = require('child_process').fork
let path = require('path')
let fs = require('fs')
let http = require('http')
let chalk = require('chalk')

module.exports = {start}

function start(callback) {

  let arcPath = path.join(process.cwd(), '.arc')
  let arc = parse(fs.readFileSync(arcPath).toString())
  let close = x=> !x

  // if .arc has events and we're not clobbering with ARC_LOCAL flag
  if (arc.events && !process.env.hasOwnProperty('ARC_LOCAL')) {
    // start a little web server
    let server = http.createServer(function listener(req, res) {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString() // convert Buffer to string
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
    close = server.close
    // start listening on 3334
    server.listen(3334, callback ? callback: x=>!x)
  }
  return {close}
}
