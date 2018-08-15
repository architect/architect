let chalk = require('chalk')

module.exports = function msg1(params) {
  let verified = !params.some(p=> p.status != 'SUCCESS')
  let title = verified? chalk.dim.green('✔ Certificate Verification CNAME') : chalk.dim.yellow('Certficate not yet verified!\n')

  let nameColour = verified? chalk.green: chalk.yellow.bold
  let valueColour = verified? chalk.green: chalk.yellow

  let body = chalk.grey(`
${title}
                Name ${nameColour(params[0].name)}
               Value ${valueColour(params[0].value)}
      `)
  if (params[1].Name != params[0].Name) {
      body += chalk.grey(`
                Name ${nameColour(params[1].name)}
               Value ${valueColour(params[1].value)}
        `)
  }
  console.log(body)
}
