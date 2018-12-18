let glob = require('glob')
let parallel = require('run-parallel')
let npm = require('../../util/npm')
let _progress = require('../../util/progress')
let progress

module.exports = function hydrateCommon(callback) {
  parallel({
    shared(callback) {
      // any folders under shared with package.json
      let path = 'src/shared/**/package.json'
      glob(path, callback)
    },
    views(callback) {
      // any folders under views with package.json
      let path = 'src/views/**/package.json'
      glob(path, callback)
    }
  },
  function _glob(err, both) {
    if (err)  {
      callback(err)
    }
    else {
      let results = both.shared.concat(both.views)
      // clean up shared + views by removing 'package.json' and paths that include node_modules
      let common = results.map(p=> p.replace('package.json', '')).filter(e=> !e.includes('node_modules'))
      if (common.length === 0) return callback()
      // two ticks per install
      let total = common.length*2
      progress = _progress({
        name: 'Installing common dependencies',
        total
      })
      // exec the fn in parallel across all folders
      parallel(common.map(pathToCode => {
        return function install(callback) {
          progress.tick()
          npm(pathToCode, ['ci', '--ignore-scripts'], err => {
            progress.tick()
            if (err) {
              console.error(err)
            }
            callback()
          })
        }
      }),
      function(err) {
        if (err) throw err
        callback()
      })
    }
  })
}
