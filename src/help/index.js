let chalk = require('chalk')
let d = chalk.grey
let D = chalk.grey.bold
let g = chalk.green
let G = chalk.green.bold
let b = chalk.bold

let helps = {
  help: `${G('arc [command] <options>')}

${chalk.grey.bold('Usage')}
  ${g('arc', G('init'), '[name or path]')} ${d('................... initialize project files')}
  ${g('arc', G('sandbox'))} ${d('............................... start a local arc development server')}
  ${g('arc', G('deploy'), '[direct|static|production]')} ${d('..... deploy to AWS')}
  ${g('arc', G('logs'), 'path/to/fn', '[production|destroy]')} ${d('.. manage function logs')}
  ${g('arc', G('help'), '<command>')} ${d('........................ get help')}
  ${g('arc', G('version'))} ${d('............................... get the current version')}
  ${g('arc', G('env'))} ${d('................................... work with environment variables')}
  ${g('arc', G('destroy'))} ${d('............................... destroy your current project')}
`,

  init: `${G('arc <init|create>')} ${g('[app-name or path] [options]')}
Generate an arc project.
When ${b('no arguments are passed')}, arc will look for an app.arc file in the local directory and ensure any resources defined in it are created locally.
When passed a ${b('path-like argument')}, arc will create a new project in the specified path (including an app.arc project manifest file).
When passed ${b('any other argument')}, arc will create a new project with that argument as the app name in the current working directory (including an app.arc project manifest file).

${D('Options')}
  ${g(`-s${d(',')}`, `--static${d(',')}`)} ${d('........... initialize a static web app')}
  ${g(`-r${d(',')}`, `--runtime${d(',')}`)} ${d('......... initialize project with a specific runtime; can be one of:')}
    ${d(D('node'), ',', D('js'), '..... nodejs14.x')}
    ${d(D('deno'), '.......... deno')}
    ${d(D('rb'), ',', D('ruby'), '..... ruby2.7')}
    ${d(D('python'), ',', D('py'), '... python3.9')}`
  ,

  deploy: `${G('arc deploy')} ${g('[options]')}
Deploy with ${b('AWS SAM')} to a CloudFormation Stack name of the form AppNameEnvironment (default environment is staging)

${D('Options')}
  ${g(`-p${d(',')}`, `--production${d(',')}`)} ${d(`............ set environment to production, i.e. ${D('--production')} results in a Stack name of ${D('AppNameProduction')}`)}
  ${g(`-d${d(',')}`, `--direct${d(',')}`, '<path/to/function>')} ${d('... directly deploy only function code and config by uploading and overwriting; optionally specify a path to one or more functions to only deploy the specified functions')}
  ${g(`-s${d(',')}`, `--static${d(',')}`)} ${d('.................... upload static assets (by default in /public) to the static S3 bucket')}
  ${g(`-v${d(',')}`, `--verbose${d(',')}`)} ${d('.................. prints all output to console')}
  ${g(`-n${d(',')}`, `--name${d(',')}`)} ${d(`........................ append to Stack name, i.e. ${D('--name CI')} results in a Stack name of ${D('AppNameStagingCI')}`)}
  ${g(`-t${d(',')}`, `--tags${d(',')}`)} ${d('........................ add tags to Stack')}
  ${g(`--prune${d(',')}`)} ${d('.......................... delete orphaned static files from the static S3 bucket; files that are not present in the local @static directory (by default in /public) will be removed')}
  ${g('--no-hydrate')} ${d('............................ skip hydrating functions before deploy; arc will not try to install dependencies in each of your function directories')}
`,

  sandbox: `${G('arc sandbox')} ${g('[options]')}
Start a local web server and in-memory database. This server will mount your @http and @ws functions on the routes you have defined in your app.arc. It will also serve your @static assets. @events and @queues are supported. @tables and @indexes will be created using Dynalite, a fast in-memory database with a DynamoDB API.

${D('Options')}
  ${g(`-p${d(',')}`, `--port${d(',')}`)} ${d('..... port the web server will listen on (default is 3333)')}
  ${g(`--disable-symlinks`)} ${d('... do not use symlinks to mount `src/shared` into all arc functions; instead copy files direct (warning: slower)')}

${D('Keyboard Shortcuts')}
${d('Sandbox registers a few keyboard shortcuts you may invoke to help with local development (note: they are all capital letters!):')}
  ${g('S')} ${d('..... re-hydrates (installs dependencies) `src/shared` and copies or symlinks it into all function code')}
  ${g('S')} ${d('..... re-hydrates (installs dependencies) `src/views` and copies or symlinks it into all function code')}
  ${g('H')} ${d('..... re-hydrates (installs dependencies) both `src/shared` and `src/views` and copies or symlinks both into all function code')}
`,

  version: `${G('arc version')}
Print the current version.`,

  env: `${G('arc env [[add|remove] --environment <testing|staging|prduction> VARIABLE_NAME variable_value]')}
Read and write environment variables. Sensitive configuration data, such as API keys, needs to happen outside of revision control and you can use this tool to ensure an entire team and the deployment targets are in sync.
Any environment variables written using this command will be available to functions at runtime. ${b('The \'testing\' environment is for local execution using `arc sandbox`')}.
By default, environment variables will be written to the preferences.arc file. However, if a .env file exists in the project root, variables will be written there instead.

${D('Options')}
${g(`arc env`)} ${d('..................................................................... displays all environment variables for the current app.arc and writes them to prefs.arc or .env')}
  ${g(`arc env [-e [testing|staging|production]]`)} ${d('........................................ displays all environment variables for the specified environment')}
  ${g(`arc env <-a|--add> -e <testing|staging|production> VARIABLE_NAME variable_value`)} ${d('................ assigns a value to the specified variable name in the specified environment')}
  ${g(`arc env <-r|--remove> -e <testing|staging|production> VARIABLE_NAME`)} ${d('... removes the specified variable from the specified environment')}
`,

  destroy: `${G('arc destroy')}
Destroy your Architect application. Deletes all resources associated with your app (including CloudFormation Stack, environment variables, CloudWatch Logs and deployment bucket). Unless --production or --name are specified, this command will destroy your staging Stack.

${D('Options')}
  ${g(`--app`)} ${d('.......... name of your app (required)')}
  ${g(`--name`)} ${d('......... target custom named environment; used to destroy an app that used `deploy`\'s --name flag')}
  ${g(`--force`)} ${d('........ destroy an app that has database tables and/or static assets')}
  ${g(`--production`)} ${d('... destroy the production version of your app')}
  ${g(`--no-timeout`)} ${d('... by default, `destroy` times out after approximately 150 seconds, but by specifying this flag, `destroy` will wait until all application resources are removed before exiting')}
`,

  logs: `${G('arc logs [options] <path/to/function>')}
Anytime your remotely-deployed functions log to stdout, those get stored in CloudWatch. \`arc logs\` lets you retrieve these logs for debugging or monitoring. ${b('You must provide a path argument to one of your functions')} (i.e. \`arc logs src/http/get-index\`). Unless --production is specified, this command will retrieve logs from the staging Stack.

${D('Options')}
  ${d(`${g('-v')}, ${g(`--verbose`)}, ............... run in verbose mode`)}
  ${d(`${g('-n')}, ${g(`--destroy`)}, ............... delete logs for the specified function`)}
  ${d(`${g('-p')}, ${g(`--production`)}, ............ retrieve (or delete, if combined with --destroy) logs for the production Stack`)}
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
