let assert = require('@smallwins/validate/assert')
let fingerprintConfig = require('@architect/utils').fingerprint.config
let publishToS3 = require('./_publish-to-s3')

module.exports = function deploy(params, callback) {
  assert(params, {
    env: String,
    arc: Object
  })

  let {arc, env, prune} = params
  let {static} = arc

  // Exit early if @static pragma is not specified
  let skip = !static
  if (skip) {
    callback()
  }
  else {
    // Enable deletion of files not present in public/ folder
    prune = prune || false
    if (static.some(s => {
      if (!s[0]) return false
      if (s.includes('prune') && s.includes(true)) return true
      return false
    })) {prune = true}

    let fingerprint = fingerprintConfig(arc).fingerprint
    let ignore = fingerprintConfig(arc).ignore

    let index = env === 'staging' ? 0 : 1
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
