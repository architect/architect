/*
 * Lambda names:
 * - Up to 64 characters
 * - Can contain only letters, numbers, hyphens, and underscores
 *
 * Arc 4+ names Lambdas as such:
 * - dashes:      '-' == '_'
 * - dots:        '.' == '_'
 * - underscores: '_' == '_'
 * - slashes:     '/' == '-'
 * - params:      ':' == '000'
 *
 * This is a lossy substitution, optimized for human readability
 * One should not expect to be able to reliably extract Arc names from Lambda names created with this encoding
 * Also, order matters: slashes should be converted last, after there are no more dashes to convert
*/

module.exports = function getLambdaName(fn) {
  return fn === '/'
    ? '-index'
    : fn.replace(/-/g,  '_')
        .replace(/\./g, '_')
        .replace(/_/g,  '_')
        .replace(/\//g, '-')
        .replace(/:/g,  '000')
}
