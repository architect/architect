let chalk = require('chalk')

module.exports = function msg0(params) {
  let title = chalk.dim.green('✔ Requested certificate')
  let colour = chalk.yellow.bold
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
