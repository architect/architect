let chalk = require('chalk')

// pretty print the distribution domains
module.exports = function _print(params) {
  console.log(chalk.grey(`
${chalk.green.dim('✔ Cloudfront Distribution Domains')}    
          Production ${chalk.green(params.production.distributionDomainName)}
             Staging ${chalk.green(params.staging.distributionDomainName)}
  `))
 // console.log(chalk.grey('\nPlease add the records above to your DNS provider; if you wish to start over run', chalk.green('npx dns nuke'), 'to delete the certificate and domains.'))
}
