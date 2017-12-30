var chalk = require('chalk')
var pad = require('lodash.padend')
var _getName = require('./lambda/_get-function-name')
var _getUrl = require('./lambda/_get-url')

/**
 * generates the completion report
 */
module.exports = function _report(params, callback) {
  var {results, env, arc, start, stats} = params
  var end = Date.now()
  var h1 = `Success!`
  var h1a = ` Deployed ${results.length} Lambdas in `
  var h1b = `${(end - start)/1000}s`
  var title = chalk.green(h1) + chalk.green.dim(h1a) + chalk.green(h1b)
  console.log(title)
  var hr = ''
  for (var i = 0; i < (h1.length + h1a.length + h1b.length); i++) hr += '-'
  console.log(chalk.cyan.dim(hr))
  var longest = 0
  var longestName = 0
  results.forEach(r=> {
    var cur = r.length
    var n = _getName({arc, env, pathToCode:r}).length
    if (cur > longest) longest = cur
    if (n > longestName) longestName = n
  })
  results.forEach(srcPath=> {
    var leftLen = longest + 4
    var left = chalk.cyan.dim(pad(srcPath + ' ', leftLen, '.'))
    var name = _getName({arc, env, pathToCode:srcPath})
    var right = chalk.cyan(name)
    var padd = ' '
    for (var i = 0; i < ((longestName - name.length) + 3); i++) padd += '.'
    padd += ' '
    var stat = stats.find(s=> s.name === srcPath)
    var size = stat? stat.size : '?'
    console.log(left + ' ' + right + chalk.cyan.dim(padd) + chalk.green(size))
  })
  var isHTTP = results.find(r=> r.includes('src/html') || r.includes('src/json'))
  if (isHTTP) {
    _getUrl({
      env,
      arc,
    },
    function _gotUrl(err, url) {
      if (err) {
        console.log(err)
      }
      else {
        var pretty = chalk.cyan.underline(url)
        console.log('\n' + pretty)
        console.log('\n')
      }
      callback()
    })
  }
  else {
    callback()
  }
}
