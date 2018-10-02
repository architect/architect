module.exports = function bundleCode(params, callback) {
  if (params.tick) params.tick()
  // TODO add support for browserify --standalone --node in a tmp deploy package here when NODE_ENV == production
  callback()
}
