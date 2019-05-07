let chalk = require('chalk')

module.exports = function _local(result) {

  let res = chalk.dim('Inventory') +'\n'
  res += chalk.cyan.bold(result.app)+'\n'
  res += '\n'+chalk.dim('IAM Roles')+'\n'
  res += chalk.cyan(result.iamroles.join('\n'))+'\n'

  if (result.s3buckets.length > 0) {
    res += chalk.dim('S3 Buckets')+'\n'
    res += chalk.cyan(result.s3buckets.join('\n'))+'\n'
  }

  if (result.restapis.length > 0) {
    res += '\n'+chalk.dim('API Gateway Rest APIs')+'\n'
    res += chalk.cyan(result.restapis.join('\n'))+'\n'
  }

  if (result.websocketapis.length > 0) {
    res += '\n'+chalk.dim('API Gateway Web Socket APIs')+'\n'
    res += chalk.cyan(result.websocketapis.join('\n'))+'\n'
  }

  if (result.lambdas.length > 0) {
    res += '\n'+chalk.dim(`Lambda Functions (${result.lambdas.length})` )+'\n'
    res += chalk.cyan(result.lambdas.join('\n'))+'\n'
  }

  if (result.tables.length > 0) {
    res += '\n'+chalk.dim(`DynamoDB Tables`)+'\n'
    res += chalk.cyan(result.tables.join('\n'))+'\n'
  }

  if (result.snstopics.length > 0) {
    res += '\n'+chalk.dim(`SNS Topics`)+'\n'
    res += chalk.cyan(result.snstopics.join('\n'))+'\n'
  }

  if (result.sqstopics.length > 0) {
    res += '\n'+chalk.dim(`SQS Topics`)+'\n'
    res += chalk.cyan(result.sqstopics.join('\n'))+'\n'
  }

  console.log(res)
}
