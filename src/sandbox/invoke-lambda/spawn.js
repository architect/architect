let spawn = require('child_process').spawn

module.exports = function spawnChild(command, args, options, timeout, callback) {
  let cwd = options.cwd
  let timedout = false
  // run the show
  let child = spawn(command, args, options)
  let stdout = ''
  let stderr = ''

  // bake a timeout
  let to = setTimeout(function () {
    timedout = true
    child.kill()
  }, timeout)

  child.stdout.on('data', data => {
    // always capture data piped to stdout
    // python buffers so you might get everything despite our best efforts
    stdout += data
  })

  child.stderr.on('data', data => {
    stderr += data
  })

  child.on('close', function done (code) {
    // Output any console logging from the child process
    let tidy = stdout.toString()
      .split('\n')
      .filter(line => !line.startsWith('__ARC__'))
      .join('\n').trim()
    if (tidy.length > 0) {
      console.log(tidy)
    }
    if (stderr) {
      console.error(stderr)
    }

    clearTimeout(to) // ensure the timeout doesn't block
    if (timedout) {
      callback(null, {
        type: 'text/html',
        body: `<h1>Timeout Error</h1>
        <p>Lambda <code>${cwd}</code> timed out after <b>${timeout / 1000} seconds</b></p>`
      })
    } else if (code === 0) {
      // extract the __ARC__ line
      let command = line => line.startsWith('__ARC__')
      let result = stdout.split('\n').find(command)
      if (result && result !== '__ARC__ undefined') {
        let raw = result.replace('__ARC__', '')
        let parsed = JSON.parse(raw)
        // if its an error pretty print it
        if (parsed.name && parsed.message && parsed.stack) {
          parsed.body = `
          <h1>${parsed.name}</h1>
          <p>${parsed.message}</p>
          <pre>${parsed.stack}</pre>
          `
          parsed.code = 500
          parsed.type = 'text/html'
        }
        // otherwise just return the command line
        callback(null, parsed)
      } else {
        callback(null, {
          type: 'text/html',
          body: `<h1>Async Error</h1>
          <p>Lambda <code>${cwd}</code> ran without executing the completion callback or returning a value.</p>

          HTTP Lambda functions that utilize <code>@architect/functions</code> must ensure <code>res</code> gets called.

          <pre>
let arc = require('@architect/functions')

function route(req, res) {
  res({html:'ensure res gets called'})
}

exports.handler = arc.http(route)
          </pre>

          Dependency free functions must return an Object with the any of following keys to send an HTTP response:
          <li><code>type</code></li>
          <li><code>body</code></li>
          <li><code>status</code> or <code>code</code></li>
          <li><code>location</code></li>
          <li><code>cookie</code></li>
          <li><code>cors</code></li>

          `
        })
      }
    } else {
      callback(null, {type: 'text/html', body: `<pre>${code}...${stdout}</pre><pre>${stderr}</pre>`})
    }
  })
}

