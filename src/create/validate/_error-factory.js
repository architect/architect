let assert = require('@smallwins/validate/assert')
/**
 * Returns a generic javascript Error with the following required properties:
 *
 * - linenumber
 * - raw
 * - arc
 * - message
 * - detail
 */
module.exports = function errorFactory(params) {
  assert(params, {
    linenumber: Number,
    raw: String,
    arc: Object,
    message: String,
    detail: String,
  })
  let err = Error(params.message)
  err.linenumber = params.linenumber
  err.raw = params.raw
  err.arc = params.arc
  err.detail = params.detail
  return err
}
