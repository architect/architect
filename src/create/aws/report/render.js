let chalk = require('chalk')
let res = s=> console.log(chalk.cyan.underline(s))

module.exports = function render(arc, result) {

  let region = process.env.AWS_REGION
  let appname = arc.app[0]

  let httpStaging = result.http.find(api=> api.name === `${appname}-staging`).id
  let httpProduction = result.http.find(api=> api.name === `${appname}-production`).id

  let wsStaging = result.ws.find(api=> api.Name === `${appname}-ws-staging`).ApiEndpoint
  let wsProduction = result.ws.find(api=> api.Name === `${appname}-ws-production`).ApiEndpoint

  res(`https://${httpStaging}.execute-api.${region}.amazonaws.com/staging`)
  res(`https://${httpProduction}.execute-api.${region}.amazonaws.com/production`)

  res(`${wsStaging}/staging`)
  res(`${wsProduction}/production`)
}
