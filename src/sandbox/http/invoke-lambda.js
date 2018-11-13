let parse = require('@architect/parser')
let {spawn} = require('child_process')
let path = require('path')
let exists = require('path-exists').sync
let fs = require('fs')
let minify = script => '"' + script.replace(/\n/g, '').trim() + '"'

/**
 * mocks a lambda.. not much to it eh!
 */

module.exports = function local(cwd, event, callback) {

  // defaults
  let env = Object.assign({}, process.env, {
    __ARC_REQ__ : JSON.stringify(event),
    PYTHONUNBUFFERED: true
  })

  let timedout = false
  let timeout = 3*1000 // 3 seconds in milliseconds
  let runtime = path.join(__dirname, '/runtimes/node.js')
  let command = 'node'
  let script = fs.readFileSync(runtime).toString()
  let options = ['-e', minify(script)]
  let args = {shell:true, cwd, env}

  // select the command based on the current function runtime (look at .arc then at .arc-config for override)
  let config = exists(path.join(cwd, '.arc-config'))
  if (config) {
    let raw = fs.readFileSync(path.join(cwd, '.arc-config')).toString()
    let arc = parse(raw)
    let runtime = arc.aws.find(tuple=> tuple.includes('runtime'))
    if (runtime && runtime[1] === 'python3.6') {
      runtime = path.join(__dirname, '/runtimes/python.py')
      command = 'python3'
      script = `"${fs.readFileSync(runtime).toString()}"`
      options = ['-c', script]
    }

    let ttl = arc.aws.find(tuple=> tuple.includes('timeout'))
    if (ttl && ttl[1] > 3 && ttl[1] < 900) {
      timeout = ttl[1]*1000 // ttl seconds in milliseconds
    }
  }

  // run the show
  let child = spawn(command, options, args)
  let stdout = ''
  let stderr = ''

  // bake a timeout
  setTimeout(function() {
    timedout = true
    child.kill()
  }, timeout)

  child.stdout.on('data', data=> {
    // always capture data piped to stdout
    // python buffers so you might get everything despite our best efforts
    stdout += data
    let tidy = data.toString().split('\n').filter(line=> !line.startsWith('__ARC__')).join('\n').trim()
    if (tidy.length > 0)
      console.log(tidy)
  })

  child.stderr.on('data', data=> {
    stderr += data
  })

  child.on('close', function done(code) {
    if (timedout) {
      callback(null, {
        type: 'text/html',
        body: `<h1>Timeout Error</h1>
        <p>Lambda <code>${cwd}</code> timed out after <b>${timeout/1000} seconds</b></p>`
      })
    }
    else if (code === 0) {
      // extract the __ARC__ line
      let command = line=> line.startsWith('__ARC__')
      let result = stdout.split('\n').find(command)
      if (result && result != '__ARC__ undefined') {
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
      }
      else {
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
    }
    else {
      callback(null, {type:'text/html', body:`<pre>${code}...${stdout}</pre><pre>${stderr}</pre>`})
    }
  })
}
