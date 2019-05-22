let cp = require('cpr')
let exists = require('path-exists').sync
let join = require('path').join
let sep = require('path').sep

/**
 * Static asset manifest copier
 */
module.exports = function copyStatic(pathToCode, callback) {
  // Normalize to absolute paths
  let dest
  if (pathToCode.startsWith(`src${sep}`)) {
    dest = join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  }
  else {
    dest = join(pathToCode, 'node_modules', '@architect', 'shared')
  }
  let staticFileDest = join(dest, 'static.json')

  let staticFileSrc = join(process.cwd(), 'public', 'static.json')

  if (exists(staticFileSrc)) {
    copy(staticFileSrc, staticFileDest, callback)
  }
  else callback()
}

// Reusable copier, always overwrites
function copy(source, destination, callback) {
  cp(source, destination, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}
