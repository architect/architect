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
  let env = {
    __ARC_REQ__ : JSON.stringify(event),
    PYTHONUNBUFFERED: true
  }

  let runtime = path.join(__dirname, '/runtimes/node.js')
  let command = 'node'
  let script = fs.readFileSync(runtime).toString()
  let options = ['-e', minify(script)]
  let args = {shell:true, cwd, env}

  // select the command based on the current function runtime (look at .arc then at .arc-config for override)
  let config = exists(path.join(cwd, '.arc-config'))
  if (config) {
    runtime = path.join(__dirname, '/runtimes/python.py')
    command = 'python3'
    script = `"${fs.readFileSync(runtime).toString()}"`
    options = ['-c', script]
  }

  // run the show
  let child = spawn(command, options, args)
  let stdout = ''
  let stderr = ''

  child.stdout.on('data', data=> {
    // always capture data piped to stdout
    // python buffers so you might get everything despite our best efforts
    stdout += data
    let tidy = data.toString().split('\n').filter(line=> !line.startsWith('__ARC__')).join('\n')
    console.log(tidy)
  })

  child.stderr.on('data', data=> {
    stderr += data
  })

  child.on('close', function done(code) {
    if (code === 0) {
      // extract the __ARC__ line
      let command = line=> line.startsWith('__ARC__')
      let result = stdout.split('\n').find(command).replace('__ARC__', '')
      let parsed = JSON.parse(result)
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
      callback(null, {type:'text/html', body:`<pre>${code}...${stdout}</pre><pre>${stderr}</pre>`})
    }
  })
}
