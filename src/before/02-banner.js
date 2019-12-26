let utils = require('@architect/utils')
let ver = require('../../package.json').version

module.exports = function banner(cmd) {
  try {
    // Commands specified below musthave valid credetials to operate
    let needsValidCreds = cmd == 'deploy' ||
                          cmd == 'env' ||
                          cmd == 'logs'
    utils.banner({
      needsValidCreds,
      version: `Architect ${ver}`
    })
    if (process.env.INITIALIZED) {
      let update = utils.updater('Create')
      update.done('Created Architect project manifest (.arc)')
    }
  }
  catch(e) {
    console.log(e)
  }
}
