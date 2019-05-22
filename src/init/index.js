let parallel = require('run-parallel')
let code = require('./lambda-code')
let assets = require('./public-code')
/**
 * [new!] cannonical code generator
 *
 * rules:
 *
 * - goes fast: init an entire .arc file in one shot in parallel
 * - dep free!!!
 * - min files possible
 * - min code possible
 * - only one comment at the top of the file
 */
module.exports = function generate(arc, callback) {

  let find = setting=> setting[0] === 'runtime'
  let runtime = arc.aws && arc.aws.some(find)? arc.aws.find(find)[1] : 'nodejs10.x'
  let functions = []

  // generate ./public with minimal set of static assets
  if (arc.static)
    functions = functions.concat(assets)

  // generate http functions
  if (arc.http) {
    let type = 'http'
    functions = functions.concat(arc.http.map(route=> {
      return code.bind({}, {type, runtime, method: route[0], path: route[1]})
    }))
  }

  //let eventFunctions = arc.events.map()
  //let queueFunctions = arc.queues.map()
  //let tableFunctions = arc.tables.map()
  //let wsFunctions = arc.ws.map()

  parallel(functions, function done(err) {
    if (err) callback(err)
    else callback()
  })
}
