var aws = require('aws-sdk')
var parallel = require('run-parallel')
var _requestCertificate = require('./_request-certificate')

module.exports = function _acm(domain, callback) {
    (new aws.ACM).listCertificates({}, function(err, result) {
      if (err) throw err
      var hasStaging = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`)
      var hasProduction = result.CertificateSummaryList.find(c=> c.DomainName === domain)
      var skip = !!(hasStaging && hasProduction)
      if (skip) {
        callback()
      }
      else {
        //create any.foo.bar and *.any.foo.bar if they do not exist
        parallel([
          _requestCertificate.bind({}, domain),
          _requestCertificate.bind({}, `*.${domain}`),
        ],
        function _done() {
          // exit with a message to rerun this command
          var banner = chalk.dim('Requested certificates for')
          var body = chalk.cyan.underline(domain)
          var footer = chalk.yellow.dim('Check domain admin email to verify certs and then rerun ')
          var footer1 = chalk.dim.green('npm run dns')
          var footer2 = chalk.yellow.dim('to continue.')
          var foot = `${footer} ${footer1} ${footer2}`
          console.log(`\n${banner} ${body}\n${foot}\n`)
          process.exit(0)
        })
      }
    })
  }
