/*
 * Lambda names:
 * - Up to 64 characters
 * - Can contain only letters, numbers, hyphens, and underscores
 *
 * Arc 4+ names Lambdas as such:
 * - slashes:     '/' == '-'
 * - dashes:      '-' == '_'
 * - dots:        '.' == '_'
 * - underscores: '_' == '_'
 * - params:      ':' == '000'
 *
 * This is a lossy substitution, optimized for human readability
 * One should not expect to be able to reliably extract Arc names from Lambda names created with this encoding
*/

module.exports = function getLambdaName(fn) {
  return fn === '/'
    ? '-index'
    : fn.replace(/\//g, '-')
        .replace(/-/g,  '_')
        .replace(/\./g, '_')
        .replace(/_/g,  '_')
        .replace(/:/g,  '000')
}
