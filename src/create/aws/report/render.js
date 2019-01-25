let chalk = require('chalk')
let res = s=> console.log(chalk.cyan.underline(s))

module.exports = function render(arc, result) {
  let region = process.env.AWS_REGION
  let appname = arc.app[0]

  let restApis = arc.hasOwnProperty('http')
  let websocketApis = arc.hasOwnProperty('ws')

  if (restApis) {
    let httpStaging = result.http.find(api=> api.name === `${appname}-staging`).id
    let httpProduction = result.http.find(api=> api.name === `${appname}-production`).id

    res(`https://${httpStaging}.execute-api.${region}.amazonaws.com/staging`)
    res(`https://${httpProduction}.execute-api.${region}.amazonaws.com/production`)
  }

  if (websocketApis) {
    let wsStaging = result.ws.find(api=> api.Name === `${appname}-ws-staging`).ApiEndpoint
    let wsProduction = result.ws.find(api=> api.Name === `${appname}-ws-production`).ApiEndpoint

    res(`${wsStaging}/staging`)
    res(`${wsProduction}/production`)
  }
}
