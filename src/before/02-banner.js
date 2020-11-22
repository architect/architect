let { banner, updater } = require('@architect/utils')
let { version: ver } = require('../../package.json')

module.exports = function runBanner ({ cmd, inventory }) {
  try {
    // Commands specified below musthave valid credetials to operate
    let needsValidCreds = cmd == 'deploy' ||
                          cmd == 'env' ||
                          cmd == 'logs'
    banner({
      inventory,
      needsValidCreds,
      version: `Architect ${ver}`
    })
    if (process.env.INITIALIZED) {
      let update = updater('Create')
      update.done('Created Architect project manifest (.arc)')
    }
  }
  catch (e) {
    console.log(e)
  }
}
