let parse = require('@architect/parser')
let join = require('path').join
let read = require('fs').readFile

let getTimeout = require('./get-timeout')
let spawn = require('./spawn')

let minify = script=> '"' + script.replace(/\n/g, '').trim() + '"'
let nodeRuntimeScriptPath = join(__dirname, '/runtimes/node.js')
let pythonRuntimeScriptPath = join(__dirname, '/runtimes/python.py')
let rubyRuntimeScriptPath = join(__dirname, '/runtimes/ruby.rb')

/**
 * mocks a lambda.. not much to it eh!
 */
module.exports = function local(cwd, event, callback) {
  let defaults = {
    __ARC_REQ__: JSON.stringify(event),
    PYTHONUNBUFFERED: true
  }
  let env = {...process.env, ...defaults}
  let options = {shell: true, cwd, env}
  let configure = handleConfig.bind(null, options, callback)
  read(join(cwd, '.arc-config'), 'utf8', configure)
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
      case 'ruby2.5':
        runInRuby(options, timeout, callback)
        break
      case 'python3.7':
        runInPython(options, timeout, callback)
        break
      case 'python3.6':
        runInPython(options, timeout, callback)
        break
      default:
        runInNode(options, timeout, callback)
    }
  }
}

function runInNode(options, timeout, callback) {
  let runScript = handleNodeScript.bind(null, options, timeout, callback)
  read(nodeRuntimeScriptPath, 'utf8', runScript)
}

function handleNodeScript(options, timeout, callback, err, data) {
  if (err) {
    // if we've gotten this far and no node script file is found go boom
    throw err
  }
  else {
    let command = 'node'
    let script = data.toString()
    let args = ['-e', minify(script)]
    spawn(command, args, options, timeout, callback)
  }
}

function runInPython(options, timeout, callback) {
  let runScript = handlePythonScript.bind(null, options, timeout, callback)
  read(pythonRuntimeScriptPath, 'utf8', runScript)
}

function handlePythonScript(options, timeout, callback, err, data) {
  if (err) {
    // if we've gotten this far and no python script file is found go boom
    throw err
  }
  let command = 'python3'
  let script = `"${data.toString()}"`
  let args = ['-c', script]
  spawn(command, args, options, timeout, callback)
}

function runInRuby(options, timeout, callback) {
  let runScript = handleRubyScript.bind(null, options, timeout, callback)
  read(rubyRuntimeScriptPath, 'utf8', runScript)
}

function handleRubyScript(options, timeout, callback, err, data) {
  if (err) throw err
  let command = 'ruby'
  let script = data.toString()
  let args = script.split('\n').filter(Boolean).map(line=> ['-e', `"${line}"`]).reduce((a, b)=> a.concat(b))
  spawn(command, args, options, timeout, callback)
}
