let getConfig = require('./get-config')
let runInNode = require('./run-in-node')
let runInPython = require('./run-in-python')
let runInRuby = require('./run-in-ruby')

let runtimes = {
  'ruby2.5': runInRuby,
  'python3.7': runInPython,
  'nodejs10.x': runInNode,
}

/**
 * mocks a lambda.. not much to it eh!
 *
 * @param {string} pathToLambda - path to lambda function code
 * @param {object} event - payload to invoke lambda function with
 * @param {function} callback - node style errback
 */
module.exports = function invokeLambda(pathToLambda, event, callback) {

  let defaults = {
    __ARC_REQ__: JSON.stringify(event),
    PYTHONUNBUFFERED: true
  }

  let options = {
    shell: true,
    cwd: pathToLambda,
    env: {...process.env, ...defaults}
  }

  getConfig(pathToLambda, function done(err, {runtime, timeout}) {
    if (err) callback(err)
    else {
      runtimes[runtime](options, timeout, callback)
    }
  })
}
