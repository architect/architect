// deps
let read = require('fs').readFileSync
let join = require('path').join
let cat = (p='.arc')=> read(join(process.cwd(), p)).toString()
let parse = require('@architect/parser')
let chalk = require('chalk')
let child = require('child_process')
// lookup env stuff
let win = process.platform.startsWith('win')
let cmd = win? 'npm.cmd' : 'npm'
let args = ['-v']
let options = {shell:true}
let subprocess = child.spawnSync(cmd, args, options)
let version = subprocess.stdout.toString().trim()
let arcVersion = require(join(__dirname, '..', '..', 'package.json')).version

function err(msg) {
  console.log(chalk.bgBlack.red.bold('Error'), chalk.bgBlack.white.bold(msg))
  process.exit(1)
}
// runs before:
//
// - [x] config
// - [x] create
// - [x] deploy
// - [x] dns
// - [x] env
// - [x] hydrate
// - [x] inventory (all commands require region)
// - [x] sandbox (when NODE_ENV=staging or NODE_ENV=production)
//
// - ensures AWS_REGION and AWS_PROFILE exist
// - also ensures Node >=8.10.x and npm >= 6.x
// - prints out the execution env in the banner (=
//
// future: spawn bg process that checks for update
module.exports = function credentials(callback) {

  // parse the .arc file
  let raw
  let arc
  try {
    raw = cat()
    arc = parse(raw)
  }
  catch(e) {
    err(e.message)
    process.exit(1)
  }

  // setup creds
  if (arc.aws) {
    let region = arc.aws.find(e=> e[0] === 'region')
    let profile = arc.aws.find(e=> e[0] === 'profile')

    if (!region)
      err('@aws missing region in .arc')

    if (!profile)
      err('@aws missing profile in .arc')

    process.env.AWS_REGION = region[1]
    process.env.AWS_PROFILE = profile[1]
  }

  if (!process.env.AWS_REGION)
    process.env.AWS_REGION = 'us-west-2'

  let missingProfile = !process.env.AWS_PROFILE
  let missingSecretAccessKey = !process.env.AWS_SECRET_ACCESS_KEY
  let missingAccessKeyId = !process.env.AWS_ACCESS_KEY_ID
  if (missingProfile && missingSecretAccessKey && missingAccessKeyId) {
    process.env.AWS_PROFILE = 'xxx'
    process.env.AWS_SECRET_ACCESS_KEY = 'xxx'
    process.env.AWS_ACCESS_KEY_ID = 'xxx'
  }

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
  callback(null, arc, raw)
}
