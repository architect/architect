let glob = require('glob')
let spawn = require('child_process').spawn
let path = require('path')
let parallel = require('run-parallel')
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
          let cwd = path.join(process.cwd(), pathToCode)
          let win = process.platform.startsWith('win')
          let cmd = win? 'npm.cmd' : 'npm'
          let args = ['ci', '--ignore-scripts']
          let options = {cwd, shell:true}
          let subprocess = spawn(cmd, args, options)
          // one tick for opening the process
          progress.tick()
          subprocess.on('close', function win() {
            // and one tick per close
            progress.tick()
            callback()
          })
          subprocess.on('error', function fail(err) {
            if (err)
              console.log('npm ci failed', err)
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
