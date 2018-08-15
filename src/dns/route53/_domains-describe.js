let chalk = require('chalk')

// pretty print the distribution domains
module.exports = function _print(params) {
  console.log(chalk.grey(`
${chalk.green.dim('✔ Distribution Domains')}    
                Name ${chalk.green(params.staging.domainName)}
               Value ${chalk.green.dim(params.staging.distributionDomainName)}

                Name ${chalk.green(params.production.domainName)}
               Value ${chalk.green.dim(params.production.distributionDomainName)}
  `))
 // console.log(chalk.grey('\nPlease add the records above to your DNS provider; if you wish to start over run', chalk.green('npx dns nuke'), 'to delete the certificate and domains.'))
}
