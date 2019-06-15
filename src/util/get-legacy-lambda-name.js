/**
 * Lambda names:
 * - Up to 64 characters
 * - Can contain only letters, numbers, hyphens, and underscores
 *
 * Arc legacy Lambda names replace slashes with dashes, and express-style params with 000
 * - Legacy versions also allowed for overlapping replacement of both dashes and dots a long time ago
 * - Dashes were removed, periods remained in validation but may have been disabled elsewhere
 * - (And later, dashes and periods added back for new http functions in v4+)
 */

module.exports = function getLambdaName(fn) {
  return fn === '/'
    ? '-index'
    : fn.replace(/\//g, '-')
        .replace(/\./g, '-')
        .replace(/:/g, '000')
}
