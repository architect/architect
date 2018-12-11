/* eslint global-require: "off" */
let path = require('path')
let fs = require('fs')
let { spawn } = require('child_process')
let chalk = require('chalk')
let parse = require('@architect/parser')

function invokeLambda(lambda, event, callback) {
  let cwd = path.join(process.cwd(), 'src', lambda)
  let command = process.execPath
  let args = [path.join(__dirname, '/runtimes/node.js')]
  let config = fs.existsSync(path.join(cwd, '.arc-config'))
  let timeout = 3 // default 3 seconds

  if (config) {
    let raw = fs.readFileSync(path.join(cwd, '.arc-config')).toString()
    let arc = parse(raw)
    let runtime = arc.aws.find(tuple => tuple.includes('runtime'))
    if (runtime && runtime[1] === 'python3.6') {
      command = '/usr/local/bin/python3' // TODO: actually lookup correct python3 path
      args = [path.join(__dirname, '/runtimes/python.py')]
    }

    let ttl = arc.aws.find(tuple => tuple.includes('timeout'))
    if (ttl && ttl[1] > 3 && ttl[1] < 900) {
      timeout = ttl[1] // ttl seconds in milliseconds
    }
  }

  let child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
  })

  const stdout = []
  const stdoutPrefix = chalk.grey.dim('@' + lambda + ' | ')
  child.stdout.on('data', chunk => {
    process.stdout.write(stdoutPrefix + chunk.toString())
    stdout.push(chunk)
  })
  const stderr = []
  const stderrPrefix = chalk.red.dim('@' + lambda + ' | ')
  child.stderr.on('data', chunk => {
    process.stderr.write(stderrPrefix + chunk.toString())
    stderr.push(chunk)
  })

  let timedout = false
  setTimeout(() => {
    timedout = true
    child.kill()
  }, timeout * 1000)

  child.stdin.write(JSON.stringify(event))
  child.stdin.end()

  let raw = ''
  let result

  let tryParseResponse = () => {
    if (result) {
      // ignore further data after first successful parse
      return
    }
    try {
      result = JSON.parse(raw)
    } catch (err) {
      return
    }
    if (result) {
      child.kill()
    }
  }

  child.stdio[3].on('data', chunk => {
    raw += chunk.toString()
    tryParseResponse()
  })
  child.on('error', error => {
    console.log(error)
    callback(error)
  })
  child.on('exit', code => {
    if (result) {
      if (result.name && result.message && result.stack) {
        callback(new LambdaRuntimeError(lambda, result))
      }
      else {
        // process was killed after a successful tryParseResponse
        callback(null, result)
      }
    }
    else if (timedout) {
      callback(new LambdaTimeoutError(lambda, timeout))
    }
    else if (code === 0) {
      tryParseResponse()
      callback(null, result)
    }
    else {
      callback(new LambdaCrashError(lambda, code, Buffer.concat(stdout), Buffer.concat(stderr)))
    }
  })
}

class LambdaError extends Error {
  constructor(lambda, message) {
    super(message)
    this.lambda = lambda
  }
}

class LambdaTimeoutError extends LambdaError {
  constructor(lambda, ttl) {
    super(lambda, `timed out after ${ttl} seconds.`)
    this.ttl = ttl
  }
}

class LambdaCrashError extends LambdaError {
  constructor(lambda, code, stdout, stderr) {
    super(lambda, [`exited with code ${code}`, stdout, stderr].filter(Boolean).join('\n'))
    this.code = code
    this.stdout = stdout
    this.stderr = stderr
  }
}

class LambdaRuntimeError extends LambdaError {
  constructor(lambda, {message, name, stack}) {
    super(lambda, message)
    this.name = name
    this.stack = stack
  }
}

module.exports = { invokeLambda, LambdaTimeoutError, LambdaCrashError, LambdaRuntimeError }
