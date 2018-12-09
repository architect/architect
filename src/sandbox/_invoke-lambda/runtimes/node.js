let path = require('path')
let fs = require('fs')
let handler = require(path.join(process.cwd(), 'index')).handler;
let rawMessage = ''
let event

process.stdin.on('data', function _onInput(data) {
  rawMessage += data.toString()
  try {
    event = JSON.parse(rawMessage)
    process.stdin.removeListener('data', _onInput)
  } catch (err) {
    // wait for more data
  }
  if (event) {
    invokeHandler()
  }
})

function invokeHandler() {
  var context = {
    succeed(x) {
      callback(null, x)
    },
    fail(x) {
      callback(x)
    }
  };
  try {
    if (handler.constructor.name === 'AsyncFunction') {
      handler(event, context, callback).then(result => callback(null, result)).catch(callback)
    } else {
      handler(event, context, callback)
    }
  } catch (error) {
    callback(error)
  }
}

function callback(err, result) {
  let payload = err ? {name: err.name, message: err.message, stack: err.stack} : result;
  let response = JSON.stringify(payload)
  if (response) {
    fs.writeSync(3, new Buffer(response))
  }
  process.exit(0)
}

