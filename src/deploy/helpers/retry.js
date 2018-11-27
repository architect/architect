/**
 * store retries in process singleton
 *
 * // save a retry
 * retry({pathToCode:'src/http/get-index'})
 *
 * // read retries
 * let retries = retry()
 */
let retries = []
module.exports = function retry(params) {
  if (params)
    retries.push(params)
  return retries
}
