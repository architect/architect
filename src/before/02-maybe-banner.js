let utils = require('@architect/utils')
let ver = require('../../package.json').version

module.exports = function maybeBanner() {
  let version = `Architect ${ver}`
  try {
    utils.readArc()
    utils.banner({version})
    if (process.env.INITIALIZED) {
      let update = utils.updater('Init')
      update.done('Created new .arc file')
    }
  }
  catch(e) {
    console.log(e)
  }
}
