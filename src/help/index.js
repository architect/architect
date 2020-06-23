let chalk = require('chalk')
let d = chalk.grey
let D = chalk.grey.bold
let g = chalk.green
let G = chalk.green.bold

let helps = {
  help: `${G('arc [command] <options>')}

${chalk.grey.bold('Usage')}
  ${g('arc', G('init'), '[name or path]')} ${d('................... initialize project files')}
  ${g('arc', G('sandbox'))} ${d('............................... work locally')}
  ${g('arc', G('repl'))} ${d('.................................. repl into dynamodb')}
  ${g('arc', G('package'))} ${d('............................... export sam.json')}
  ${g('arc', G('deploy'), '[dirty|static|production]')} ${d('...... deploy with CFN')}
  ${g('arc', G('logs'), 'path/to/code', '[production|nuke]')} ${d('... work with logs')}
  ${g('arc', G('help'), '<command>')} ${d('........................ get help')}
  ${g('arc', G('version'))} ${d('............................... get the current version')}
  ${g('arc', G('env'))} ${d('................................... work with environment variables')}
`,

  init: `${G('arc init')}
${d('generate project and project files based on .arc (including .arc if none exists)')}`,

  package: `${G('arc package')}
generate sam.json based on .arc`,

  deploy: `${G('arc deploy')} ${g('[options]')}

${d('Deploy with', D('AWS SAM'), 'to AppNameStaging stack')}

${D('Options')}
  ${g(`-p${d(',')}`, `--production${d(',')}`, 'production')} ${d('... set env to production')}
  ${g(`-d${d(',')}`, `--dirty${d(',')}`, 'dirty')} ${d('............. *staging only* dirty deploy function code/config')}
  ${g(`-s${d(',')}`, `--static${d(',')}`, 'static')} ${d('........... dirty deploys /public to s3 bucket')}
  ${g(`-v${d(',')}`, `--verbose${d(',')}`, 'verbose')} ${d('......... prints all output to console')}
  ${g(`-n${d(',')}`, `--name${d(',')}`, 'name')} ${d('............... append to stack name')}
  ${g(`-t${d(',')}`, `--tags${d(',')}`, 'tags')} ${d('............... add key=value tags to stack')}
`,

  repl: `${G('arc repl')}
start a repl based on .arc`,

  sandbox: `${G('arc sandbox')}
start a local web server on 3333`,

  version: `${G('arc version')}
get the current version`,

  env: `${G('arc env')}
Read and write environment variables. Sensitive configuration data, such as API keys, needs to happen outside of the codebase in revision control and you can use this tool to ensure an entire team and the deployment targets are in sync.
${g(`arc env`)} ${d('..............................................................displays environment variables for the current .arc')}
${g(`arc env [testing|staging|production] [VARIABLE_NAME] [value]`)} ${d('.........assigns a value to the environment variable')}
${g(`arc env remove [testing|staging|production] [VARIABLE_NAME]`)} ${d('..........removes environment variable from environment')}
`
}

helps.create = helps.init

module.exports = function help (opts) {
  if (opts.length === 0) {
    console.log(helps.help)
  }
  else if (opts[0] && helps[opts[0]]) {
    console.log(helps[opts[0]])
  }
  else {
    console.log(`Sorry, no help found for: ${opts[0]}`)
  }
}
