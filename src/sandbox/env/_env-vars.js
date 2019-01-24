let populateEnv = require('../../util/populate-env')

module.exports = function _setupEnv(inventory, callback) {

  let name = inventory.app

  // populate ARC_APP_NAME (used by @architect/functions event.publish)
  process.env.ARC_APP_NAME = name

  // set up command flags
  //let env
  let port
  let command = process.argv.slice(2).map(c => {
    if (c.slice().includes('=')) {
      return c.split('=')
    } else {
      return c
    }
  })
  command.map(c => {
    /*
    if (c === 'testing' ||
        c === '--testing' ||
        c === '-t') {
      env = 'testing'
    }
    if (c === 'staging' ||
        c === '--staging' ||
        c === '-s') {
      env = 'staging'
    }
    if (c === 'production' ||
        c === '--production' ||
        c === '-p') {
      env = 'production'
    }*/
    if (Array.isArray(c)) {
      if (c[0] === '--port' && Number(c[1]) >= 2 && Number(c[1]) <= 65535) {
        port = Number(c[1])
      }
    }
    else {
      return c
    }
  })

  // populate SESSION_TABLE_NAME (used by @architect/functions http functions)
  // override w .arc-env
  //FIXME tmp patch for process.env.SESSION_TABLE_NAME = 'jwe'
  process.env.SESSION_TABLE_NAME = 'arc-sessions'

  // populate PORT (used by http server)
  if (!process.env.PORT) {
    process.env.PORT = `3333`
  }
  if (typeof port === 'number') {
    process.env.PORT = port
  }

  // Populate env vars locally
  populateEnv(callback)
}
