let assert = require('@smallwins/validate/assert')
let mkdir = require('mkdirp').sync
let path = require('path')
let pathExists = require('path-exists').sync
let publishToS3 = require('./_publish-to-s3')

module.exports = function deploy(params, callback) {
  assert(params, {
    env: String,
    arc: Object
  })

  let static = params.arc.static

  // Exit early if @static pragma is not specified
  let skip = !static
  if (skip) {
    callback()
  }
  else {
    // Enable deletion of files not present in public/ folder
    let prune = params.prune || false
    if (static.some(s => {
      if (!s[0]) return false
      if (s.includes('prune') && s.includes(true)) return true
      return false
    })) {prune = true}

    // Enable fingerprinting
    let fingerprint = true
    if (static.some(s => {
      if (!s[0]) return false
      if (s.includes('fingerprint') && s.includes(false)) return true
      return false
    })) {fingerprint = false}

    // Collect any strings to match against for ignore
    let ignore = static.find(s => s['ignore'])
    if (ignore) {ignore = Object.getOwnPropertyNames(ignore.ignore)}
    else {ignore = []}

    // Create public if it does not exist

    let publicDir = path.join(process.cwd(), 'public')
    if (!pathExists(publicDir)) {mkdir(publicDir)}

    let index = params.env === 'staging' ? 0 : 1
    let Bucket = static[index][1]
    let S3params = {
      Bucket,
      fingerprint,
      ignore,
      prune,
    }
    publishToS3(S3params, callback)
  }
}
