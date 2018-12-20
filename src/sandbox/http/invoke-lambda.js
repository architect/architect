const parse = require('@architect/parser')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const readFile = fs.readFile
const minify = script => '"' + script.replace(/\n/g, '').trim() + '"'
const nodeRuntimeScriptPath = path.join(__dirname, '/runtimes/node.js')
const pythonRuntimeScriptPath = path.join(__dirname, '/runtimes/python.py')
/**
 * mocks a lambda.. not much to it eh!
 */
module.exports = function local (cwd, event, callback) {
  // env defaults
  let env = Object.assign(
    {},
    process.env,
    {
      __ARC_REQ__: JSON.stringify(event),
      PYTHONUNBUFFERED: true
    }
  )

  let options = {shell: true, cwd, env}
  let configure = handleConfig.bind(null, options, callback)
  readFile(path.join(cwd, '.arc-config'), 'utf8', configure)
}

function handleConfig (options, callback, err, data) {
  if (err) {
    // if .arc-config file not found assume node runtime
    runInNode(options, getTimeout(), callback)
  } else {
    let arc = parse(data.toString())
    let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
    let runtime = awsRuntime && awsRuntime[1]
    let timeout = getTimeout(arc)

    switch (runtime) {
      case 'python3.6':
        runInPython(options, timeout, callback)
        break
      default:
        runInNode(options, timeout, callback)
    }
  }
}

function getTimeout (arc) {
  // 5s is the default timeout that Architect provisions new Lambdas
  // Establish parity locally at 5s, but allow for override since devs may be phoning home to dbs via a slow connection
  // This global timeout will be overridden by individual .arc-config files in functions
  let timeout = process.env.SANDBOX_TIMEOUT && process.env.SANDBOX_TIMEOUT * 1000
  timeout = timeout || 5 * 1000 // 5 seconds in milliseconds
  let ttl = arc && arc.aws.find(tuple => tuple.includes('timeout'))
  // valid ttl is between 3 and 900 seconds (15 minutes)
  if (ttl && ttl[1] > 3 && ttl[1] < 900) {
    timeout = ttl[1] * 1000 // ttl seconds in milliseconds
  }
  return timeout
}

function runInNode (options, timeout, callback) {
  let runScript = handleNodeScript.bind(null, options, timeout, callback)
  readFile(nodeRuntimeScriptPath, 'utf8', runScript)
}

function handleNodeScript (options, timeout, callback, err, data) {
  if (err) {
    // if we've gotten this far and no node script file is found go boom
    throw err
  } else {
    let command = 'node'
    let script = data.toString()
    let args = ['-e', minify(script)]
    spawnChild(command, args, options, timeout, callback)
  }
}

function runInPython (options, timeout, callback) {
  let runScript = handlePythonScript.bind(null, options, timeout, callback)
  readFile(pythonRuntimeScriptPath, 'utf8', runScript)
}

function handlePythonScript (options, timeout, callback, err, data) {
  if (err) {
    // if we've gotten this far and no python script file is found go boom
    throw err
  }
  let command = 'python3'
  let script = `"${data.toString()}"`
  let args = ['-c', script]
  spawnChild(command, args, options, timeout, callback)
}

function spawnChild (command, args, options, timeout, callback) {
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
