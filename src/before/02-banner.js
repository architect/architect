let { banner } = require('@architect/utils')
let { version: ver } = require('../../package.json')

module.exports = function runBanner ({ cmd, inventory }) {
  try {
    // Commands specified below musthave valid credetials to operate
    let needsValidCreds = [ 'deploy', 'env', 'logs' ].includes(cmd)
    banner({
      inventory,
      needsValidCreds,
      version: `Architect ${ver}`
    })
  }
  catch (e) {
    console.log(e)
  }
}
