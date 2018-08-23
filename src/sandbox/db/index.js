let check = require('./_check-port')
let dynalite = require('dynalite')
let init = require('./_init')
let server

/**
 * starts an in-memory dynalite dynamodb server
 *
 * - automatically creates any tables or indexes defined by the arcfile
 * - also creates a local session table
 */
function start(callback) {
  let handle = {close(){server.close()}}
  check(function _check(err, inUse) {
    if (err) throw err
    if (inUse) {
      server = {close(){}}
      init(callback)
    }
    else {
      server = dynalite({
        createTableMs: 0
      }).listen(5000, function _server(err) {
        if (err) {
          // if we err then the db has been started elsewhere..
          // just try to continue
          console.log(err)
        }
        init(callback)
      })
    }
  })
  return handle
}

module.exports = {
  start
}
