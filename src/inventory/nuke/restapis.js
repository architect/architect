let aws = require('aws-sdk')
let series = require('run-series')
let print = require('./_print')

module.exports = function restapis(inventory, callback) {
  if (inventory.types.http.length === 0) {
    callback()
  }
  else {
    let {header, notfound, error, deleted} = print(inventory)
    header('API Gateway REST APIs')
    let api = new aws.APIGateway({region: process.env.AWS_REGION})
    api.getRestApis({limit:500}, function _getRestApis(err, result) {
      if (err) {
        error(err.message)
        callback()
      }
      else {
        var founds = []
        var name = `${inventory.app}-staging`
        var staging = result.items.find(o=> o.name === name)
        if (staging) {
          founds.push(staging)
        }
        else {
          notfound(name)
        }
        var name = `${inventory.app}-production`
        var production = result.items.find(o=> o.name === name)
        if (production) {
          founds.push(production)
        }
        else {
          notfound(name)
        }
        let timeout = 0
        var funs = founds.map(subject=> {
          return function deleteApi(callback) {
            setTimeout(function delay() {
              timeout = 30*1000
              api.deleteRestApi({restApiId:subject.id}, function _deleted(err) {
                if (err) {
                  callback(err)
                }
                else {
                  deleted(subject.name, subject.id)
                  callback()
                }
              })
            }, timeout)
          }
        })
        series(funs, function done(err) {
          if (err) {
            error(err.message)
          }
          callback()
        })
      }
    })
  }
}
