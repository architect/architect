const chalk = require('chalk')
const glob = require('glob')
const path = require('path')
const readArc = require('../../util/read-arc')
const lambdaPath = require('../../util/get-lambda-name')
const cp = require('cpr')
/**
 * copies ./src/views into lambda ./node_modules/@architect/views
 * if @views exists in .arc file it will only copy into the routes specifed there
 */
module.exports = function _views (callback) {
  let src = path.join(process.cwd(), 'src', 'views')
  let parsed = readArc()
  let arc = parsed.arc
  let views = arc.views
  let paths

  // If @views is defined in .arc then use those route paths
  if (views.length) {
    paths = views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
  } else {
    // Else copy into all the @http gets
    paths = glob.sync('src/@(http)/get-*')
  }

  paths.forEach(p => {
    let dest = path.join(process.cwd(), p, 'node_modules', '@architect', 'views')
    cp(src, dest, {overwrite: true}, callback)
    console.log(chalk.dim(chalk.green.dim('✓'), 'src/views copied to lambda node_modules/@architect/views'))
  })
}
