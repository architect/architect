let getLambdaName = require('../util/get-lambda-name')
let fs = require('fs')
let mkdir = require('mkdirp').sync
let {join} = require('path')

/**
 * @param {string} type - required. one of: http, event, queue, table, ws
 * @param {string} runtime - required. one of:  node, ruby, python
 * @param {string} method - optional. one of: get, post, put, delete, patch
 * @param {string} path - optional. of the format: /foo/:bar/baz
 */
module.exports = function code({type, runtime, method, path}, callback) {

  let folder = `${method.toLowerCase()}${getLambdaName(path)}`
  let extension = getExtension(runtime)
  let basePath = join(process.cwd(), 'src', type, folder)
  let fullPath = join(basePath, `index.${extension}`)

  if (fs.existsSync(basePath)) {
    callback()
  }
  else {
    mkdir(basePath)

    let body

    if (type === 'http' && extension === 'js') {
      body = `// learn more about http functions here: https://arc.codes/guides/http
exports.handler = async function http(req) {
  return {
    headers: {'content-type': 'text/html; charset=utf8'}, 
    body: '<b>hello world from nodejs<b>'
  }
}`
    }

    if (type === 'http' && extension === 'py') {
      fs.writeFileSync(join(basePath, '.arc-config'), `@aws\nruntime python3.7`)
      body = `// learn more about http functions here: https://arc.codes/guides/http
def handler(req, context):
  return {'headers': {'content-type': 'text/html'}, 'body': '<b>hello world from python<b>'}`
    }

    if (type === 'http' && extension === 'rb') {
      fs.writeFileSync(join(basePath, '.arc-config'), `@aws\nruntime ruby2.5`)
      body = `// learn more about http functions here: https://arc.codes/guides/http
def handler(req)
  {headers: {'content-type': 'text/html'}, body: '<b>hello world from ruby<b>'}
end`
    }

    fs.writeFile(fullPath, body, callback)
  }
}

/**
 * @param {string} runtime - string that starts with: node, python, ruby
 * @returns {string} one of: js, py or rb
 */
function getExtension(runtime) {
  if (runtime.startsWith('node')) return 'js'
  if (runtime.startsWith('python')) return 'py'
  if (runtime.startsWith('ruby')) return 'rb'
  throw Error('invalid runtime')
}
