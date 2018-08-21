let zip = require('zipit')

module.exports =  function _readCode(name, role, callback) {
  zip({
    input: [
      `src/queues/${name}/index.js`,
      `src/queues/${name}/package.json`,
      `src/queues/${name}/node_modules`
    ],
    cwd: process.cwd()
  },
  function _zip(err, buffer) {
    if (err) {
      callback(err)
      console.log(err)
    }
    else {
      callback(null, buffer, role)
    }
  })
}
