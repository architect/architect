let chalk = require('chalk')
let child = require('child_process')
// lookup env stuff
let win = process.platform.startsWith('win')
let cmd = win? 'npm.cmd' : 'npm'
let args = ['-v']
let options = {shell:true}
let subprocess = child.spawnSync(cmd, args, options)
let version = subprocess.stdout.toString().trim()
let err = require('./_err')
let join = require('path').join

module.exports = function printBanner(arc) {

  let nodeVersionArr = process.version.replace('v', '').split('.').map(Number);
  let nodeMajorOk = nodeVersionArr[0] >= 8
  let nodeMinorOk = nodeVersionArr[0] > 8 || nodeVersionArr[1] >= 10

  if (!(nodeMajorOk && nodeMinorOk))
    err(`Node@${process.version} is not valid; must be 8.10 or higher`)

  let npmOk = Number(version.split('.')[0]) >= 6
  if (process.env.NODE_ENV != 'testing' && !npmOk)
    err('invalid npm version; must be 6 or higher')

  // Suppress init header
  if (process.env.QUIET) {
    return ''
  }

  //
  // drawing!
  //
  let name = arc.app[0]
  let region = process.env.AWS_REGION
  let profile = process.env.AWS_PROFILE
  let arcVersion = require(join(__dirname, '..', '..', '..', 'package.json')).version
  let x = process.platform.startsWith('win')? '~' : '⌁'
  console.log(chalk.grey(`        app ${x} ${chalk.cyan.bold(name)}`))
  console.log(chalk.grey(`     region ${x} ${chalk.cyan(region)}`))
  console.log(chalk.grey(`    profile ${x} ${chalk.cyan(profile)}`))
  console.log(chalk.grey(`    version ${x} ${chalk.cyan(arcVersion)}\n`))
}
