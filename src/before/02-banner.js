let utils = require('@architect/utils')
let ver = require('../../package.json').version

module.exports = function maybeBanner() {
  let version = `Architect ${ver}`
  try {
    utils.readArc()
    utils.banner({version})
    if (process.env.INITIALIZED) {
      let update = utils.updater('Create')
      update.done('Created Architect project manifest (.arc)')
    }
  }
  catch(e) {
    console.log(e)
  }
}
