let chalk = require('chalk')

module.exports = function _local(result) {

  let appHeader = chalk.dim('Inventory')
  let app = chalk.cyan.bold(result.app)
  let iamHeader = chalk.dim('IAM Roles')
  let iam = chalk.cyan(result.iamroles.join('\n'))
  let s3Header = chalk.dim('S3 Buckets')
  let s3 = chalk.cyan(result.s3buckets.join('\n'))
  let restapisHeader = chalk.dim('API Gateway Rest APIs')
  let restapis = chalk.cyan(result.restapis.join('\n'))
  let lambdaHeader = chalk.dim(`Lambda Functions (${result.lambdas.length})` )
  let lambdas = chalk.cyan(result.lambdas.join('\n'))
  let tableHeader = chalk.dim(`DynamoDB Tables`)
  let tables = chalk.cyan(result.tables.join('\n'))
  let snstopicsHeader = chalk.dim(`SNS Topics`)
  let snstopics = chalk.cyan(result.snstopics.join('\n'))

    console.log(`
${appHeader}
${app}

${iamHeader}
${iam}

${s3Header}
${s3}

${restapisHeader}
${restapis}

${lambdaHeader}
${lambdas}

${tableHeader}
${tables}

${snstopicsHeader}
${snstopics}
    `)
}
