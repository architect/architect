let aws = require('aws-sdk')
let series = require('run-series')
let waterfall = require('run-waterfall')
let print = require('./_print')

module.exports = function snstopics(inventory, callback) {
  let {header,/* notfound, error, */deleted} = print(inventory)
  if (inventory.cwerules.length > 0)
    header(`CloudWatch Events Rules`)

  let cloudwatchevents = new aws.CloudWatchEvents({region: process.env.AWS_REGION})
  series(inventory.cwerules.map(Rule=> {
    return function deleteRule(callback) {
      waterfall([
        function(callback) {
          cloudwatchevents.listTargetsByRule({
            Rule,
          }, callback)
        },
        function({Targets}, callback) {
          let Ids = Targets.map(t=> t.Id)
          Targets.forEach(i=> {
            deleted(i.Id, i.Arn)
          })
          cloudwatchevents.removeTargets({
            Ids,
            Rule,
          }, callback)
        },
        function(result, callback) {
          cloudwatchevents.deleteRule({
            Name: Rule,
          }, callback)
        }
      ], callback)
    }
  }), callback)
}
