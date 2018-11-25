let retries = []

module.exports = function retry(params) {
  if (params)
    retries.push(params)
  return retries
}
