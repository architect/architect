let chalk = require('chalk')
let d = chalk.grey
let D = chalk.grey.bold
let g = chalk.green
let G = chalk.green.bold
let b = chalk.bold

let helps = {
  help: `${G('arc [command] <options>')}

${D('Global Commands')}
  ${g('arc', G('<init|create>'), '[name or path]')} ${d('.......... initialize new arc project')}
  ${g('arc', G('help'), '<command>')} ${d('........................ get help')}
  ${g('arc', G('version'))} ${d('............................... get the current version')}
${D('Project Commands')}
  ${g('arc', G('<init|create>'))} ${d('......................... idempotently initialize project files')}
  ${g('arc', G('sandbox'))} ${d('............................... start a local arc development server')}
  ${g('arc', G('deploy'), '[direct|static|production]')} ${d('..... deploy to AWS')}
  ${g('arc', G('logs'), 'path/to/fn', '[production|destroy]')} ${d('.. manage function logs')}
  ${g('arc', G('env'))} ${d('................................... work with environment variables')}
  ${g('arc', G('destroy'))} ${d('............................... destroy your current project')}
`,

  init: `${G('arc <init|create>')} ${g('[name or path] [options]')}
Generate a new arc project at the specified path, or if run in an existing arc project, idempotently initialize any missing function directories.
When used with the ${g('--plugin')} flag, generates a new arc plugin project at the specified path instead.
When ${b('no arguments are passed')}, arc will look for an app.arc file in the local directory and idempotently initialize any resources defined in it; that is, if they do not exist, they will be created locally.
When passed a ${b('path-like argument')}, arc will create a new project in the specified path (including an app.arc project manifest file).
When passed ${b('any other argument')}, arc will create a new project with that argument as the app name in the current working directory (including an app.arc project manifest file).

${D('Options')}
  ${g(`-n${d(',')}`, '--name')} ${d('............ app name; sets `@app` in your app.arc file')}
  ${g('--no-install')} ${d('.......... do not automatically install `@architect/architect` as a dependency in the project')}
  ${g(`-p${d(',')}`)} ${g('--plugin')} ${d('.......... create a scaffolded architect plugin project')}
  ${g(`-r${d(',')}`, `--runtime ${d('......... initialize project with a specific runtime. If unspecified, will default to node. Can be one of:')}`)}
    ${d(D('node'), ',', D('js'), '..... nodejs22.x')}
    ${d(D('deno'), '.......... deno')}
    ${d(D('rb'), ',', D('ruby'), '..... ruby3.3')}
    ${d(D('python'), ',', D('py'), '... python3.13')}
  ${g(`-v${d(',')}`)} ${g('--verbose')} ${d('......... run in verbose mode')}`
  ,

  deploy: `${G('arc deploy')} ${g('[options]')}
Deploy your app, as defined in your app.arc manifest, to a CloudFormation Stack. The @app name and environment (more on this below) determine the Stack your application will deploy to. Furthermore, Stacks are unique per region therefore changing your target AWS region will change the target Stack to deploy to.
By default, this command deploys a staging version of your application to a dedicated CloudFormation Stack. By providing the ${g('-p')} or ${g('--production')} flag you can deploy to a separate production Stack.
You can target additional Stacks by using the ${g('--name')} flag; this will append the provided name to the Stack name and is a technique to create arbitrary additional deployment environments beyond staging and production.
When passed the ${g('--direct')} flag in conjunction with a path-like argument to a Lambda source directory, instead of a full CloudFormation deploy, arc will only deploy source code for the provided Lambda. This will be much faster and may be helpful when wanting to deploy small, isolated changes.

${D('Options')}
  ${g(`--direct`, '<path/to/function>')} ${d('... directly deploy only provided function code and config by uploading and overwriting; optionally specify a path to one or more functions to only deploy the specified functions')}
  ${g('--dry-run')} ${d('..................... generate a CloudFormation template but do not deploy it; handy to validate CloudFormation and SAM output or to test Architect plugins')}
  ${g('--eject')} ${d('....................... generate a CloudFormation template but do not deploy it and print the `aws cloudformation` command to run to deploy it')}
  ${g(`-f${d(',')}`, `--fast`)} ${d('.................... deploy the Stack but do not wait until deployment completes')}
  ${g(`-n${d(',')}`, `--name`)} ${d(`.................... append to Stack name, i.e. ${D('--name CI')} results in a Stack name of ${D('AppNameStagingCI')}`)}
  ${g('--no-hydrate')} ${d('.................. skip hydrating functions before deploy; arc will not try to install dependencies in each of your function directories')}
  ${g(`-p${d(',')}`, `--production`)} ${d(`.............. set environment to production, i.e. ${D('--production')} results in a Stack name of ${D('AppNameProduction')}`)}
  ${g(`--prune`)} ${d('....................... delete orphaned static files from the static S3 bucket; files that are not present in the local @static directory (by default in /public) will be removed')}
  ${g(`-s${d(',')}`, `--static`)} ${d('.................. only upload static assets (by default in /public) to the static S3 bucket')}
  ${g(`-t${d(',')}`, `--tags`)} ${d('.................... add tags to Stack')}
  ${g(`-v${d(',')}`, `--verbose`)} ${d('................. print more output to console')}
  ${g(`-d${d(',')}`, `--debug`)} ${d('................... print even more output to console')}
`,

  sandbox: `${G('arc sandbox')} ${g('[options]')}
Start a local development server that emulates AWS infrastructure for your Architect application. Sandbox provides a complete local development environment that includes:

- HTTP server for your @http routes
- WebSocket server for @ws routes
- Dynalite in-memory database for @tables and @indexes
- Local event bus for @events and @queues
- Static asset serving for @static assets
- File watching and live reloading

${D('Options')}
  ${g(`-p${d(',')} --port`)} ${d('........................ port the HTTP server will listen on (default is 3333)')}
  ${g(`-h${d(',')} --host`)} ${d('........................ host the server will bind to')}
  ${g(`--disable-symlinks`)} ${d('................ do not use symlinks for shared code; use file copying instead (slower)')}
  ${g(`--disable-delete-vendor`)} ${d('........... do not delete node_modules or vendor directories upon startup')}
  ${g(`-q${d(',')} --quiet`)} ${d('....................... minimize console output during operation')}
  ${g(`-v${d(',')} --verbose`)} ${d('..................... print more detailed output during operation')}
  ${g(`-d${d(',')} --debug`)} ${d('....................... print even more detailed information for debugging')}

${D('Environment Variables')}
  ${d(`${g('ARC_HTTP_PORT')}, ${g('PORT')} ............... set the HTTP server port (same as --port)`)}
  ${d(`${g('ARC_EVENTS_PORT')} ................... set the events/queues service port (default 4444)`)}
  ${d(`${g('ARC_TABLES_PORT')} ................... set the DynamoDB emulator port (default 5555)`)}
  ${d(`${g('ARC_HOST')} .......................... set the host the server will bind to`)}
  ${d(`${g('ARC_QUIET')}, ${g('QUIET')} .................. minimize console output (same as --quiet)`)}

${D('Keyboard Shortcuts')}
${d('Sandbox registers keyboard shortcuts to help with local development (note: they are all capital letters!):')}
  ${g('S')} ${d('................................. rehydrate only src/shared')}
  ${g('V')} ${d('................................. rehydrate only src/views')}
  ${g('H')} ${d('................................. rehydrate both src/shared and src/views')}
  ${g('Ctrl+C')} ${d('............................ gracefully shut down the sandbox')}
`,

  version: `${G('arc version')}
Print the current version.`,

  env: `${G('arc env')} ${g('[options]')}
Manage environment variables for your Architect application across different environments. This command allows you to read, add, and remove environment variables that will be available to your Lambda functions at runtime.
When run ${b('without any flags')}, this command will print out all environment variables and their values, across all environments.
Environment variables are stored in AWS SSM Parameter Store for staging and production environments. For local development (testing environment), variables are stored in your project's preferences.arc file or .env file if one exists.
${b('The \'testing\' environment is used for local execution with `arc sandbox`')}. Variables for this environment are stored locally, while staging and production variables are stored in AWS SSM.

${D('Options')}
  ${g(`-e${d(',')} --env <environment>`)} ${d('... specify environment (testing, staging, or production)')}
  ${g(`-a${d(',')} --add`)} ${d('................. add a new environment variable')}
  ${g(`-r${d(',')} --remove`)} ${d('.............. remove an environment variable')}
  ${g(`-v${d(',')} --verbose`)} ${d('............. print more detailed output')}
  ${g(`-d${d(',')} --debug`)} ${d('............... print even more detailed information for debugging')}

${D('Examples')}
  ${g(`arc env`)} ${d('......................................... display all environment variables for all environments')}
  ${g(`arc env --env staging`)} ${d('........................... display all environment variables for staging')}
  ${g(`arc env --add --env testing MY_VAR "my value"`)} ${d('... add MY_VAR to testing environment')}
  ${g(`arc env --remove --env production DB_PASS`)} ${d('....... remove DB_PASS from production environment')}
`,

  destroy: `${G('arc destroy')} ${g('[options]')}
Completely removes your Architect application from AWS. This command deletes all resources associated with your application, including the CloudFormation Stack, SSM environment variables, CloudWatch Logs, deployment S3 bucket, and static S3 bucket (if applicable). 
By default, this command destroys your staging environment. Use the ${g('--production')} flag to target the production environment instead. For custom environments created with ${g('deploy --name')}, use the ${g('--name')} flag to specify the environment to destroy.
For safety reasons, if your application has database tables or static assets, ${b('you must explicitly confirm deletion')} by using the ${g('--force')} flag. There is a 5-second safety delay before destruction begins, which can be bypassed with the ${g('--now')} flag.

${D('Options')}
  ${g(`--app`)} ${d('............. app name (required for confirmation)')}
  ${g(`--force${d(',')} -f`)} ${d('....... destroy an app that has database tables and/or static assets')}
  ${g(`--name`)} ${d('............ target a custom named environment created with `deploy --name`')}
  ${g(`--now`)} ${d('............. skip the 5-second safety delay before destroying resources')}
  ${g(`--no-timeout`)} ${d('...... wait indefinitely for all application resources to be removed (by default times out after ~150 seconds)')}
  ${g(`--production${d(',')} -p`)} ${d('.. destroy the production environment instead of staging')}
  ${g(`--verbose${d(',')} -v`)} ${d('..... print more detailed information during the destroy process')}
  ${g(`--debug${d(',')} -d`)} ${d('....... print even more detailed information for debugging purposes')}
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
