let chalk = require('chalk')

module.exports = function msg1(params) {
  let verified = !params.some(p=> p.status != 'SUCCESS')
  let title = verified? chalk.dim.green('✔ Certificate verified') : chalk.dim.yellow('Certficate CNAME record is not verified!')
  let colour = verified? chalk.green: chalk.yellow.bold
  let body = chalk.grey(`
${title}

                Name ${colour(params[0].name)}
               Value ${colour(params[0].value)}
      `)
  if (params[1].Name != params[0].Name) {
      body += chalk.grey(`
                Name ${colour(params[1].name)}
               Value ${colour(params[1].value)}
        `)
  }
  console.log(body)
}
