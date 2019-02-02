let join = require('path').join
let name = require('../../util/get-lambda-name')
let log = require('./pretty-print-route')
let invoker = require('./invoke-http')

module.exports = function reg(app, api, type, routes) {
  if (routes) {
    console.log('')

    // walk all the routes
    routes.forEach(r=> {

      let verb = r[0].toLowerCase()
      let route = r[1]
      let path = name(route)
      let pathToFunction = join(process.cwd(), 'src', type, `${verb}${path}`)

      // pretty print the route reg
      log({verb, route, path})

      // reg the route with the Router instance
      let exec = invoker({verb, pathToFunction})
      app[verb](route, exec)
    })
  }
}
