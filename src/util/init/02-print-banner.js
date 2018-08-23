let join = require('path').join
let chalk = require('chalk')
let child = require('child_process')
// lookup env stuff
let win = process.platform.startsWith('win')
let cmd = win? 'npm.cmd' : 'npm'
let args = ['-v']
let options = {shell:true}
let subprocess = child.spawnSync(cmd, args, options)
let version = subprocess.stdout.toString().trim()
let arcVersion = require(join(__dirname, '..', '..', '..', 'package.json')).version
let err = require('./_err')

module.exports = function printBanner(arc) {

  let nodeVersionArr = process.version.replace('v', '').split('.').map(Number);
  let nodeMajorOk = nodeVersionArr[0] >= 8
  let nodeMinorOk = nodeVersionArr[0] > 8 || nodeVersionArr[1] >= 10

  if (!(nodeMajorOk && nodeMinorOk))
    err(`Node@${process.version} is not valid; must be 8.10 or higher`)

  let npmOk = Number(version.split('.')[0]) >= 6
  if (process.env.NODE_ENV != 'testing' && !npmOk)
    err('invalid npm version; must be 6 or higher')

  //
  // drawing!
  //
  let name = arc.app[0]
  let rightColWidth = 40
  // lil helper fn for logging
  function log(txt, val) {
    let all = chalk.bgBlack.grey.dim
    let right = chalk.cyan.bold(val.padEnd(rightColWidth, ' '))
    console.log(all(txt, right))
  }
  log('                    ', '')
  log('        ARC_APP_NAME', name + '')
  log('          AWS_REGION', process.env.AWS_REGION + '')
  log('         AWS_PROFILE', process.env.AWS_PROFILE + '')
  log('                    ', '')
  log('                Node', process.version.replace('v', ''))
  log('                 npm', version + '')
  log('                .arc', arcVersion)
  log('                    ', '')
}
