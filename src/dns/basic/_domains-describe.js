let chalk = require('chalk')

// pretty print the distribution domains
module.exports = function _print(params) {
  console.log(chalk.grey(`
${chalk.green.dim('✔ Distribution Domains')}    

                Name ${chalk.yellow.bold(params.staging.domainName)}
               Value ${chalk.yellow(params.staging.distributionDomainName)}

                Name ${chalk.yellow.bold(params.production.domainName)}
               Value ${chalk.yellow(params.production.distributionDomainName)}
  `))
  console.log(chalk.grey('\nPlease add the records above to your DNS provider; if you wish to start over run', chalk.green('npx dns nuke'), 'to delete the certificate and domains.'))
}
