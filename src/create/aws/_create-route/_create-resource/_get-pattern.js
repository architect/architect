/* eslint no-useless-escape: "off" */
// escapism: considered useful
/**
 * In the API Gateway impl of HTTP everything returns status code of 200 by default. To return any other status code the lambda handler
 * must be invoked as an error with either `context.fail` or the first param of the `callback`. Also important, you cannot invoke with
 * a real Error but rather you must invoke with an error value as String. API Gateway requires the IntegerationResponse matche the
 * error string value with a regular expression to return other status codes.
 *
 * architect supports status codes: 200, 302, 403, 404 and 500. @architect/functions response implemenation serializes JSON payloads for
 * errors and the regular expressions to match them below and deserialize/remap the payloads appropriately [1]
 *
 * [1] https://github.com/arc-repos/arc-functions/blob/master/src/http/_fmt.js
 */
module.exports = function getPattern(statusCode) {
  if (statusCode === '200') return ''      // ok
  if (statusCode === '302') return '(.*statusCode\\\":302.*)|^(http|\/.*)' // wait..
  if (statusCode === '403') return '.*statusCode\\\":403.*'
  if (statusCode === '404') return '.*statusCode\\\":404.*'
  if (statusCode === '500') return '.*statusCode\\\":500.*'
  return ''
}
