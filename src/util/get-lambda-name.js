/*
 * Lambda names:
 * - Up to 64 characters
 * - Can contain only letters, numbers, hyphens, and underscores
 *
 * Arc 4+ names Lambdas as such:
 * - slashes:     '/' == '-'
 * - dashes:      '-' == '_'
 * - params:      ':' == '000'
 * - dots:        '.' == '001'
 *
 * IMPORTANT: regex passes must be global, so order matters!
 * - replace REUSED chars with UNUSED patterns FIRST!
 * - eg slashes will become dashes, dashes will become underscores
 * - therefore replace dashes first, or both dashes and slashes will become underscores
*/

module.exports = function getLambdaName(fn) {
  return fn === '/'
    ? '-index'
    : fn.replace(/-/g, '_')
        .replace(/\//g, '-')
        .replace(/\./g, '001')
        .replace(/:/g, '000')
}
