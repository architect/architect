let chalk = require('chalk')
let d = chalk.grey
let D = chalk.grey.bold
let g = chalk.green
let G = chalk.green.bold

let helps = {
  help: `${G('arc [command] <options>')}

${chalk.grey.bold('Usage')}
  ${g('arc', G('init'), '<name>')} ${d('........................... initialize a project')}
  ${g('arc', G('sandbox'))} ${d('............................... work locally')}
  ${g('arc', G('repl'))} ${d('.................................. repl into dynamodb')}
  ${g('arc', G('package'))} ${d('............................... export sam.json')}
  ${g('arc', G('deploy'), '[dirty|static|production]')} ${d('...... deploy with CFN')}
  ${g('arc', G('logs'), 'path/to/code', '[production|nuke]')} ${d('... work with logs')}
  ${g('arc', G('help'), '<command>')} ${d('........................ get help')}
  ${g('arc', G('version'))} ${d('............................... get the current version')}
`,

  init: `${G('arc init')}
${d('generate local code based on .arc (inc  .arc if none exists)')}`,

  package: `${G('arc package')}
generate sam.json based on .arc`,

  deploy: `${G('arc deploy')} ${g('[options]')}

${d('Deploy with', D('AWS SAM'), 'to AppNameStaging stack')}
 
${D('Options')}
  ${g(`-p${d(',')}`, `--production${d(',')}`, 'production')} ${d('... deploys to AppNameProduction')}
  ${g(`-d${d(',')}`, `--dirty${d(',')}`, 'dirty')} ${d('............. *staging only* dirty deploy function code/config')}
  ${g(`-s${d(',')}`, `--static${d(',')}`, 'static')} ${d('........... dirty deploys /public to s3 bucket')}
  ${g(`-v${d(',')}`, `--verbose${d(',')}`, 'verbose')} ${d('......... prints all output to console')}
`,

  repl: `${G('arc repl')}
start a repl based on .arc`,

  sandbox: `${G('arc sandbox')}
start a local web server on 3333`,

  version: `${G('arc version')}
get the current version`
}

module.exports = function help(opts) {
  if (opts.length === 0) {
    console.log(helps.help)
  }
  else if (helps[opts[0]]) {
    console.log(helps[opts[0]])
  }
  else {
    console.log(`sorry, no help found for: ${opts[0]}`)
  }
}
