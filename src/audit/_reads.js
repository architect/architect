let inventory = require('../inventory')
let exists = require('path-exists').sync
let parallel = require('run-parallel')
let path = require('path')
let aws = require('aws-sdk')

module.exports = function _report(arc, callback) {
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  inventory(arc, null, function _inventory(err, result) {
    if (err) callback(err)
    else {
      let fns = result.lambdas.map(FunctionName=> {
        return function getLambda(callback) {
          parallel({
            // read the code on aws
            remote(callback) {
              lambda.getFunctionConfiguration({
                FunctionName
              },
              function _getFunction(err, result) {
                if (err) console.log(err)
                callback(null, {name: FunctionName, role: result.Role || false})
              })
            },
            // checks for role.yaml, if not found falls back to role.json, otherwise return false
            local(callback) {
              let appname = arc.app[0]
              let clean = FunctionName.replace(`${appname}-staging-`, '').replace(`${appname}-production-`, '')
              let type = findtype(result, clean)
              let base = path.join(process.cwd(), 'src', type, clean)
              //let yaml = path.join(base, 'role.yaml')
              let json = path.join(base, 'role.json')
              /*TODO support role.yaml
               * if (exists(yaml)) {
                callback(null, yaml)
              }
              else */
              if (exists(json)) {
                callback(null, json)
              }
              else {
                callback(null, false)
              }
            }
          },
          function almost(err, result) {
            if (err) callback(err)
            else {
              let merged = Object.assign({}, result.remote, {path:result.local})
              callback(null, merged)
            }
          })
        }
      })
      parallel(fns, callback)
    }
  })
}

function findtype(report, functionname) {
  if (report.types.http.includes(functionname)) return 'http'
  if (report.types.css.includes(functionname)) return 'css'
  if (report.types.events.includes(functionname)) return 'events'
  if (report.types.html.includes(functionname)) return 'html'
  if (report.types.js.includes(functionname)) return 'js'
  if (report.types.json.includes(functionname)) return 'json'
  if (report.types.queues.includes(functionname)) return 'queues'
  if (report.types.scheduled.includes(functionname)) return 'scheduled'
  if (report.types.slack.includes(functionname)) return 'slack'
  if (report.types.tables.includes(functionname)) return 'tables'
  if (report.types.text.includes(functionname)) return 'text'
  if (report.types.xml.includes(functionname)) return 'xml'
}
