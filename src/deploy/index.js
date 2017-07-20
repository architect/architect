var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')
var assert = require('@smallwins/validate/assert')
var zipit = require('zipit')
var glob = require('glob')
var chalk = require('chalk')
var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var lambda = new aws.Lambda

module.exports = function deploy(params, callback) {

  assert(params, {
    env: String,
    pathToArc: String,
    pathToCode: String,
  })

  var {env, pathToArc, pathToCode} = params
  var appName = parse(fs.readFileSync(pathToArc).toString()).app[0]
  var pathToPkg = path.join(pathToCode, 'package.json')

  var pkgExists = fs.existsSync(pathToPkg)
  if (!pkgExists) {
    console.log(chalk.yellow.dim('skip ' + pathToPkg + ' not found'))
    callback()
  }
  else {
    var packageName = JSON.parse(fs.readFileSync(`./${pathToPkg}`).toString()).name
    var FunctionName = `${appName}-${env}${packageName.replace(appName, '')}`

    waterfall([
      function _read(callback) {
        glob(path.join(process.cwd(), pathToCode, '/*'), callback)
      },
      function _zip(files, callback) {
        zipit({
          input: files,
        }, callback)
      },
      function _upload(buffer, callback) {
        console.log(`${chalk.dim('deploy')} ${chalk.yellow(FunctionName)} ${chalk.dim('start')}`)
        lambda.updateFunctionCode({
          FunctionName,
          ZipFile: buffer
        }, callback)
      }
    ],
    function _done(err) {
      if (err) {
        console.log(`${chalk.dim('deploy')} ${chalk.red.bold(FunctionName)} ${chalk.dim('failed')}`)
        console.log(chalk.dim(err))
      }
      else {
        console.log(`${chalk.dim('deploy')} ${chalk.green.bold(FunctionName)} ${chalk.dim('success')}`)
      }
      callback()
    })
  }
}
