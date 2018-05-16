let aws = require('aws-sdk')
let isReserved = require('./_is-reserved')

module.exports = function _put(appname, params, callback) {

  // only teh following namespaces allowed
  let allowed = [
    'testing',
    'staging',
    'production'
  ]

  // the params we expect
  let ns = params[1]
  let key = params[2]

  // the state we expect them in
  let valid = {
    ns: allowed.includes(ns),
    key: /[A-Z|_]+/.test(key) && !isReserved(key),
  }

  // blow up if something bad happens otherwise write the param
  if (!valid.ns) {
    callback(Error('invalid argument, namespace can only be one of: testing, staging or production'))
  }
  else if (!valid.key) {
    callback(Error('invalid argument, key must be all caps (and can contain underscores)'))
  }
  else {
    let ssm = new aws.SSM
    ssm.deleteParameter({
      Name: `/${appname}/${ns}/${key}`,
    },
    function done(err) {
      if (err) callback(err)
      else callback()
    })
  }
}
