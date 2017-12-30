// arc names lambdas by replacing slashes and dots with dashes and express style params with 000
module.exports = function getLambdaName(str) {
  return str === '/'? '-index' : str.replace(/\//g, '-').replace(/\./g, '-').replace(/:/g, '000')
}
