let chalk = require('chalk')
let d = chalk.grey
let D = chalk.grey.bold
let g = chalk.green
let G = chalk.green.bold

let helps = {
  help: `${G('arc [command] <options>')}

${chalk.grey.bold('Usage')}
  ${g('arc', G('init'), '[name or path]')} ${d('................... initialize project files')}
  ${g('arc', G('sandbox'))} ${d('............................... start a local arc development server')}
  ${g('arc', G('package'))} ${d('............................... export sam.json')}
  ${g('arc', G('deploy'), '[dirty|static|production]')} ${d('...... deploy with CFN')}
  ${g('arc', G('logs'), 'path/to/code', '[production|nuke]')} ${d('... work with logs')}
  ${g('arc', G('help'), '<command>')} ${d('........................ get help')}
  ${g('arc', G('version'))} ${d('............................... get the current version')}
  ${g('arc', G('env'))} ${d('................................... work with environment variables')}
  ${g('arc', G('destroy'))} ${d('............................... destroy your current project')}
`,

  init: `${G('arc init')}
${d('generate project and project files based on app.arc (including app.arc if none exists)')}`,

  package: `${G('arc package')}
generate sam.json based on app.arc`,

  deploy: `${G('arc deploy')} ${g('[options]')}

${d('Deploy with', D('AWS SAM'), 'to AppNameStaging stack')}

${D('Options')}
  ${g(`-p${d(',')}`, `--production${d(',')}`, 'production')} ${d('... set env to production')}
  ${g(`-d${d(',')}`, `--dirty${d(',')}`, 'dirty')} ${d('............. *staging only* dirty deploy function code/config')}
  ${g(`-s${d(',')}`, `--static${d(',')}`, 'static')} ${d('........... dirty deploys /public to S3 bucket')}
  ${g(`-v${d(',')}`, `--verbose${d(',')}`, 'verbose')} ${d('......... prints all output to console')}
  ${g(`-n${d(',')}`, `--name${d(',')}`, 'name')} ${d('............... append to stack name')}
  ${g(`-t${d(',')}`, `--tags${d(',')}`, 'tags')} ${d('............... add key=value tags to stack')}
`,

  sandbox: `${G('arc sandbox')} ${g('[options]')}

${d('Start a local web server and in-memory database. This server will mount your @http and @ws functions on the routes you have defined in your app.arc. It will also serve your @static assets. @events and @queues are supported. @tables and @indexes will be created using Dynalite, a fast in-memory database with a DynamoDB API.')}

${D('Options')}
  ${g(`-p${d(',')}`, `--port${d(',')}`, 'port')} ${d('..... port the web server will listen on (default is 3333)')}
  ${g(`--disable-symlinks`)} ${d('... do not use symlinks to mount `src/shared` into all arc functions; instead copy files direct (warning: slower)')}
`,

  version: `${G('arc version')}
get the current version`,

  env: `${G('arc env')}
Read and write environment variables. Sensitive configuration data, such as API keys, needs to happen outside of the codebase in revision control and you can use this tool to ensure an entire team and the deployment targets are in sync.
${g(`arc env`)} ${d('..............................................................displays environment variables for the current app.arc')}
${g(`arc env [testing|staging|production] [VARIABLE_NAME] [value]`)} ${d('.........assigns a value to the environment variable')}
${g(`arc env remove [testing|staging|production] [VARIABLE_NAME]`)} ${d('..........removes environment variable from environment')}
`,

  destroy: `${G('arc destroy')}
destroy your current project

${D('Options')}
${g(`--name`)} ${d('......... name of your app (required)')}
${g(`--force`)} ${d('........ destroy an app that has database tables and/or static assets')}
${g(`--production`)} ${d('... destroy the production stage of your app')}
`,

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
