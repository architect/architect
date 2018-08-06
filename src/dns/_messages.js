var chalk = require('chalk')

module.exports = {
  listCerts(domain) {
    var banner = chalk.dim('Requested certificates for')
    var body = chalk.cyan.underline(domain)
    var footer = chalk.yellow('Check domain admin email to verify certs and then rerun')
    var footer1 = chalk.green('npx dns')
    var footer2 = chalk.yellow('to continue.')
    var foot = `${footer} ${footer1} ${footer2}`
    console.log(`\n${banner} ${body}\n${foot}\n`)
  },
  verifyCerts() {
    var banner = chalk.dim('Certificates pending verification')
    var body = chalk.yellow('Check your email and follow the instructions to verify the certificates and then rerun')
    var cmd = chalk.green('npx dns')
    var footer = chalk.yellow('to continue.')
    console.log(`\n${banner}\n${body} ${cmd} ${footer}\n`)
  },
  ensureCerts(params) {
    var banner = chalk.bold('Certificates not issued')
    var sub = `
${typeof params.staging === 'undefined'? '𝗑' : '✔'} staging
${typeof params.production === 'undefined'? '𝗑' : '✔'} production`
    var body = chalk.yellow('AWS Certificate Manager sends two emails. Please ensure you clicked approve for both and then ')
    var cmd = chalk.green('npx dns')
    var footer = chalk.yellow('to continue.')
    console.log(`${banner}\n${sub}\n\n${body} ${cmd} ${footer}\n`)
  },
  foundHostedZone(ns) {
    var pls = chalk.dim('Please ensure your domain registration is using these nameeservers:')
    console.log(pls)
    console.log(chalk.dim.cyan.underline(ns))
    console.log('\n')
  },
  createHostedZone(domain, ns) {
    var pls = chalk.dim('Please ensure to add these nameservers to your domain registration:')
    console.log(`\n${chalk.dim('Created')} ${chalk.cyan.underline(domain)}\n`)
    console.log(pls)
    console.log(chalk.dim.cyan.underline(ns))
    console.log('\n')
  },
  success(domain) {
    var msg = ''
    msg += chalk.green('Successfully configured DNS with Route53 and API Gateway\n\n')
    msg += chalk.underline.cyan(`https://${domain}\n`)
    msg += chalk.underline.cyan(`https://staging.${domain}\n\n`)
    msg += chalk.yellow.dim('Please note: changes to DNS nameservers can take up to 24 hours to fully propagate.\n')
    console.log(msg)
  }
}
