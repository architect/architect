/* eslint no-useless-escape: "off" */
// escapism: considered useful
module.exports = function getPattern(statusCode) {
  if (statusCode === '200') return ''      // ok
  if (statusCode === '302') return '^\/.*' // wait..
  if (statusCode === '403') return '.*statusCode\\\":403.*' // lolwut
  if (statusCode === '404') return '.*statusCode\\\":404.*'
  if (statusCode === '500') return '.*statusCode\\\":500.*'
  return ''
}
