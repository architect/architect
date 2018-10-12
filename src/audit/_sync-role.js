let create = require('./_create-role')
let chalk = require('chalk')
let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let series = require('run-series')
let fs = require('fs')

let skip = thing=> console.log(chalk.green(thing.name), chalk.blue(thing.role))
let getRoleName = name=> name.replace('-staging', '').replace('-production', '')

module.exports = function _syncRole(thing, callback) {
  if (!thing.path) {
    // just print
    skip(thing)
    callback()
  }
  else {
    waterfall([
      // read the managed policies
      function read(callback) {
        let raw = fs.readFileSync(thing.path).toString()
        //let json = thing.path.split('.').reverse()[0] === 'json'
        // TODO add support for role.yaml
        let policies = JSON.parse(raw).policies
        callback(null, policies || [])
      },
      function upsert(policies, callback) {
        let RoleName = getRoleName(thing.name)
        let iam = new aws.IAM
        // check if role exists
        iam.getRole({RoleName}, function _getRole(err, result) {
          if (err && err.code === 'NoSuchEntity') {
            // create role
            create({
              name: RoleName,
              policies,
            }, callback)
          }
          else if (err) {
            console.log(err)
            // failed! reset to arc-role
            iam.getRole({
              RoleName: 'arc-role'
            },
            function _getDefault(err, result) {
              if (err) callback(err)
              else callback(null, result.Role.Arn)
            })
          }
          else {
            let RoleArn = result.Role.Arn
            // update role
            waterfall([
              // list managed policies
              function reads(callback) {
                // FIXME need to paginate roles here
                iam.listAttachedRolePolicies({
                  MaxItems: 100,
                  RoleName,
                }, callback)
              },
              // if not in the list remove it
              function removes(result, callback) {
                let fns = result.AttachedPolicies.map(p=> {
                  return function maybeRemove(callback) {
                    let PolicyArn = p.PolicyArn
                    if (policies.includes(PolicyArn)) {
                      callback()
                    }
                    else {
                      iam.detachRolePolicy({
                        RoleName,
                        PolicyArn
                      }, callback)
                    }
                  }
                })
                series(fns, callback)
              },
              // attaches policies from role.json
              function adds(result, callback) {
                let fns = policies.map(PolicyArn=> {
                  return function maybeAdd(callback) {
                    iam.attachRolePolicy({
                      RoleName,
                      PolicyArn
                    }, callback)
                  }
                })
                series(fns, callback)
              },
              function done(result, callback) {
                callback(null, RoleArn)
              }
            ], callback)
          }
        })
      },
      function update(Role, callback) {
        console.log(chalk.green(thing.name), chalk.cyan(Role))
        let lambda = new aws.Lambda({region: process.env.AWS_REGION})
        let FunctionName = thing.name
        lambda.updateFunctionConfiguration({
          FunctionName,
          Role
        }, callback)
      }
    ], callback)
  }
}
