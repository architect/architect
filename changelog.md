# Architect changelog

> Also see: [Architect Functions changelog](https://github.com/architect/functions/blob/main/_changelog.md)

---

## [10.3.3] 2022-05-11

### Changed

- Updated dependencies; sub-dep `lambda-runtimes` adds `nodejs16.x`.

---

## [10.3.2] 2022-04-29

### Fixed

- Fixed a CloudFormation syntax error that was introduced in 8.1.1; fixes #1340, thanks @lpsinger!

---

## [10.3.1] 2022-04-28

### Added

- Relaxed `@tables` IAM permissions; Lambdas can now do far more with DynamoDB out of the box


### Changed

- Use https, not http, for API Gateway proxy to static bucket; thanks @lpsinger!


### Fixed

- Sandbox now only listens to the loopback interface and will not listen for inbound connections from the network; thanks @lpsinger!
- Reduced excess CloudFormation statements for `@tables`; thanks @frankleng!

---

## [10.3.0] 2022-04-09

### Added

- Added brotli compression for static asset publishing


### Fixed

- Fail loudly when AWS-SDK finds a credentials file without default profile; thanks @stuartlangridge!
- Fixed Sandbox possibly hanging when it fails to start up in tests

---

## [10.2.2] 2022-04-08

### Fixed

- Added static asset sorting on deployment to publish `index.htm[l]` files last; fixes #1335
  - Also: `index.htm[l]` files with deeper sub-paths should publish earlier, with the root HTML file publishing last

---

## [10.2.1] 2022-03-31

### Changed

- Updated dependencies

---

## [10.2.0] 2022-03-24

### Added

- Added support for configuring Lambda's ephemeral storage feature
  - To your project manifest (eg `app.arc`) or individual `config.arc` files' `@aws` pragma, add the setting `storage {number between 512 - 10240}`

---

## [10.1.0] 2022-03-07

### Added

- Added support for Sandbox `@tables` seed data via `sandbox-seed.js[on]` (or custom) file


### Changed

- Upgraded Deno from 0.24.x to 1.19.1


### Fixed

- Added `arc` property to Sandbox plugin API calls, which should have been there
- Froze `inventory` property in Sandbox plugin API calls

---

## [10.0.5] 2022-03-03

### Fixed

- Fixed sandbox not detecting Lambda function return when process does not exit automatically; fixes #1319, thanks @mawdesley!
- Fixed regression where S3 IAM policy could prevent `@architect/asap` from properly peeking into a directory to look for a default index.html file; thanks @TillaTheHun0!

---

## [10.0.4] 2022-03-02

### Fixed

- Fixed Init writing boilerplate files for custom runtimes (currently based on the `baseRuntime`); thanks @johncantrell97!
- Fixed incorrect banner version printing when running Init locally, and not globally

---

## [10.0.3] 2022-03-01

### Added

- Added support for Sandbox SSM emulation of `ssm.getParameter()` (in addition to `ssm.getParametersByPath()`)
- Hardened Sandbox SSM emulation to have tighter query behavior, output valid errors, etc.
- Added `ARC_STACK_NAME` env var to fix missing stack name data; fixes #1322, thanks @Lugana707, @pgte


### Fixed

- Fixed Sandbox responding to all SSM requests indiscriminately
  - Sandbox now only fulfills requests for the app that it's running (or for `@architect/functions` running as a bare module)
- Fix issue where Create would attempt (and fail) to write static assets when not needed

---

## [10.0.2] 2022-02-24

### Added

- Enable `@architect/functions` to retrieve port configuration via Sandbox when run as a bare module and not within a Lambda
- In addition to the existing `@sandbox-startup` preferences pragma, now run startup commands via `@sandbox-start` preferences pragma
  - It's the same, just semantically a bit closer to `plugins.sandbox.start`


### Fixed

- Fixed missing `ARC_SANDBOX` env var `version` property in `sandbox.start` plugins + `@sandbox-startup` scripts
- Fixed error reporting in `arc destroy` when run via `arc` (and not as standalone `npx arc-destroy`)

---

## [10.0.0 - 10.0.1] 2022-02-22

### Added

- Architect 10 plugin API support! Some highlights:
  - `plugins.set.env` - add environment variables to all Lambdas
  - `plugins.set.events|http|scheduled|tables-streams|ws` - generate or drop-in Lambdas into Architect pragmas
  - `plugins.set.customLambdas` - generate or drop in unique Lambdas with custom event sources
  - `plugins.set.runtimes` - custom runtime support (still in beta)
  - `plugins.sandbox.start` - perofrm arbitrary operations on Sandbox startup
  - `plugins.sandbox.watcher` - Sandbox file watcher API
    - Added ability to disable Sandbox watcher with `watcher` (boolean) in API option
  - `plugins.sandbox.end` - perofrm arbitrary operations on Sandbox shutdown
  - `plugins.deploy.start` - mutate CloudFormation mutation and perform other arbitrary pre-deploy operations
  - `plugins.deploy.services` - add to Architect service discovery and custom Lambda config data
  - `plugins.deploy.target` - deploy Architect projects to targets other than AWS CloudFormation
  - `plugins.deploy.end` - perform arbitrary post-deploy operations
- Added Sandbox live reload support!
  - Add `@sandbox livereload true` to your preferences to enable
  - Your browser will automatically refresh any time a `get` or `any` HTTP handler changes, or when any file in `src/shared`, `src/views`, or `public` changes
- Added `inv|get.plugins` tree + methods
  - What used to be `plugins` in the plugins beta is now `customLambdas` (see next item)
- Added low-level support for `build` destinations to runtime plugins that register type `transpiled` or `compiled`
- Added `handlerModuleSystem` property for `nodejs14.x` Lambdas, with a value of `cjs` or `esm` based on Lambda + Node.js conventions
  - Added `handlerFile` detection for `nodejs14.x` + `deno` Lambdas
    - This will detect the correct handler file on the filesystem, and fall back to a default handler file if none are found (e.g. `index.js` in `nodejs14.x`)
- Added Inventory `deployStage` property, enabling Architect to be aware of an intended deploy stage, and act accordingly
  - This property may change, consider it in beta!
- Added built-in support for reading `.env` files when enumerating local env var preferences in Inventory
- Added ability to directly invoke all Architect subcommands from the CLI without using `@architect/architect`
- Added Sandbox port configuration via `prefs.arc`
  - The precedence order is now `prefs.arc` > `port` API option or `--port` CLI flag > environment variables
  - Also added `ARC_HTTP_PORT` env var for configuring the HTTP port (in addition to `PORT`)
- Added automatic Sandbox port selection for configuring internal service ports
  - (Probably) never again will your multiple simultaneous Sandbox instances conflict with each other!
  - HTTP port selection still defaults to `3333` and will halt Sandbox from starting if it conflicts (since it's presumably what you're expecting to see in your browser)
  - Any manually specified port conflicts will also halt Sandbox from starting
- Added `deploy --eject` option (functionally the same as `--dry-run`)
- Added Architect + userland env vars to Sandbox startup scripts (in addition to being present for `plugins.sandbox.start|end`)
- Sandbox watcher now restarts the Sandbox on preference file changes to ensure port changes and env vars are immediately available
- Add ability to automatically publish static assets to S3 if `fingerprint` is set to `true` or `external`, `prune` is disabled (which it is by default), and the app has a bucket; fixes #1312, thanks @gopeter!


### Changed

- Breaking change: bare CLI arguments (e.g. `hydrate update`) as aliases to flags are no longer used, please use CLI flags (e.g. `hydrate --update` or `hydrate -u`)
- Breaking change: Architect no longer automatically populates, relies on, or makes direct use of `NODE_ENV`, `ARC_CLOUDFORMATION`, `ARC_HTTP`, or `ARC_SANDBOX_PATH_TO_STATIC` env vars. `@architect/asap` v5+ now requires Architect v10 / Sandbox v5 or later.
  - Older versions of Node.js Architect libraries such as `@architect/functions` made use of these env vars, so it is wise to upgrade them at this time
  - Also be sure to consult the Architect [upgrade guide](https://arc.codes/docs/en/about/upgrade-guide)
- Breaking change: removed `toml` support (e.g. `arc.toml`)
- Breaking change: changed Inventory `_project.src`, added `_project.cwd`, making both the pair significantly more literal and descriptive
  - `_project.src` is now the default source tree folder (eg `$cwd/src`)
  - `_project.cwd` refers to the current working directory of the project
- Breaking change: Inventory `_project.env` is now by default an object populated by three properties: `local`, `plugins`, and `aws`, reflecting the env vars found for each environment
- Breaking change: AWS region prioritizes a region passed via param over `AWS_REGION` env var; this should realistically have little or no effect in practice
- Breaking change: `@indexes` is now fully deprecated; simply change the pragma name to `@tables-indexes`, no other changes are required
- Breaking change: legacy `@tables-streams` folders (`src/tables/...` and `src/streams/...`) are now deprecated
  - Existing functions can be simply moved to `src/tables-streams/{name}` (or use a custom `src` property)
- Breaking change: renamed Inventory `lambda.handlerFunction` to `lambda.handlerMethod`
- Breaking change: prioritize `mod.ts|js` handlers in Deno Lambdas (per Deno's guidelines)
  - Related, default `arc create` provisioned handler file for Deno is also now `mod.ts`
- Breaking change: passing Sandbox env vars in with the `env` API option no longer merges those env vars with any found in `.env` or `prefs.arc`
  - The new env var precedence is `env` option > `.env` > `prefs.arc`
- Breaking change: removed support for legacy `.arc-env` env files
  - Architect deprecated writing to `.arc-env` in late 2020; Sandbox will no longer read and use it for local environment variables
  - If you are still using a `.arc-env` file, please consider `prefs.arc` or `.env` for your local env vars
- Breaking change: removed `ARC_SANDBOX_ENABLE_CORS` env var option from Sandbox
  - Architect has supported `options` requests since version 8; that is the preferred approach to handling CORS
- Breaking change: consolidated `env` module API into single method
- Internal change: made Inventory responsible for handling env vars loaded from `.env` files
- Internal change: made Inventory responsible for figuring out `nodejs14.x` handler module systems and file names
- Internal change: stopped optimistically populating default `arc-sessions` + `data` tables in Sandbox
  - This was a quirky holdover behavior from early Architect that differed Sandbox from live AWS behavior
- Internal change: various AWS calls that used to rely on `AWS_REGION` now rely on Inventory region
- Internal change: refactored deployment operation order to ensure plugins run earlier and can accomplish more during deployment
- Prefer `ARC_SESSION_TABLE_NAME` to `SESSION_TABLE_NAME` env var for Architect's built-in sessions management
  - All non-namespaced names will continue to be supported until at least Architect 11; we suggest changing them over to the namespaced equivalents as soon as is convenient
- Performance memory and performance improvements in Inventory
- Lambda treeshaking (currently for Node.js) is now the default when being run from CLI
- Migrate static bucket permissions from per-object ACLs to a bucket policy so users can customize the static bucket permissions using plugins
  - See: https://github.com/architect/package/pull/148, https://github.com/architect/deploy/pull/350
- Traverse folders that start with `.` looking for Lambda package files to hydrate
- Stop publishing to the GitHub Package registry
- Updated `aws-sdk` to `2.1001.0`
- Updated dependencies


### Fixed

- Fixed issue where Lambdas configured with `@arc shared false` would still get shared code
- Fixed basic env var validation in `arc env`
- Fixed live reload behavior in Firefox where Firefox would reload the wrong path, preventing links from being accessed

---

## [9.5.3 - 9.5.4] 2022-01-11

### Fixed

- Fixed potential false tree shaking errors in ESM files that make use of `require()` (e.g. via `import { createRequire } from 'module'`)
- Fixed bug where multi-tenant Lambdas would error on Sandbox startup; thanks @andybee!

---

## [9.5.2] 2022-01-10

### Fixed

- Fixed false positive tree shaking of `import`s from http(s)

---

## [9.5.1] 2022-01-09

### Fixed

- Fixed Lambda tree shaking detection of CJS/ESM when strings `import` and `require` are present in the AST

---

## [9.5.0] 2022-01-07

### Added

- Added support for Node.js 14 ESM in Lambda!


### Fixed

- Properly invoke Ruby with required keyword params; partial fix for #1291
- Fixed incorrect `arc logs` help

---

## [9.4.2] 2021-12-01

### Added

- Added `lambdaSrc` propery (mapped from `lambda.src`) to `ARC_SANDBOX` context env var

---

## [9.4.1] 2021-11-23

### Fixed

- Fixed HTTP route sorting; however you've organized your `@http` pragma, Sandbox should now behave much more like API Gateway; fixes #977
- Fixed overly strict path parameter validation; allow `_`, `.`, `-`; thanks @jkarsrud!

---

## [9.4.0] 2021-11-16

### Added

- Added support for `@tables-streams`, the fully customizable successor to `@tables` with `stream true`
  - Includes support for specifying multiple streams attached to a single table, as well as specifying custom source paths
  - For more see: https://arc.codes/tables-streams
- Added support for `@tables-indexes` (which has the same syntax as, and will eventually supersede `@indexes`)
  - For more see: https://arc.codes/tables-indexes

---

## [9.3.1] 2021-11-13

### Added

- Added internal `ARC_SANDBOX` env var for Sandbox metadata in Lambda invocations; fixes #1269, thanks @reconbot!


### Fixed

- Fixed upcasing all userland Sandbox environment variables; fixes #1270, thanks @reconbot!
- Removed extraneous internal `__ARC*` environment variables from Sandbox Lambda invocation

---

## [9.3.0] 2021-11-11

### Added

- Sandbox now immediately streams Lambda logs to the console instead of printing everything all at once upon completion of execution; thanks @andybee!
- Added runtime mismatch warnings in Sandbox
  - Example: Sandbox will warn if your `get /foo` Lambda is configured for Python 3.9 and your local machine uses Python 3.8
  - Setting `runtimeCheck` to `error` in the Sandbox API options will ensure automated tests fail if runtimes are not properly matched
- Added `runStartupCommands` setting to Sandbox API options
  - Defaults to `true`; setting `false` disables `prefs.arc @sandbox-startup` commands, which may be useful for local testing; thanks @reconbot!
- Added `env` option to Sandbox API options allowing programmatic control (add, replace, delete) of Lambda environment variables during automated testing, thanks @actsone8!
- Added API Gateway Management API service mock to Sandbox for managing WebSocket connections via `aws-sdk` calls; big thanks to @reconbot!


### Changed

- Sandbox will only ever print a given dependency issue one time, instead of upon each invocation
- Removed support for bare `port` Sandbox CLI flag (e.g. `arc sandbox port 12345`); Sandbox now requires either `-p` or `--port` for setting the port from the CLI

---

## [9.2.2] 2021-11-02

### Changed

- Added warnings for macOS Monterey port conflicts on 5000 and 7000

---

## [9.2.1] 2021-10-28

### Fixed

- Fixed `arc init` alias creating directories called `init`

---

## [9.2.0] 2021-10-26

### Added

- Added latest-runtime version aliasing
  - Example: if you always want your app to run the latest Lambda version of Python, instead of specifying `python3.9` (and changing it every time a new version of Python is released), instead simply specify `python` or `py`
  - Valid shortcuts: Node.js: `node`, `nodejs`, `node.js`; Python: `python`, `py`; Ruby: `ruby`, `rb`; Java: `java`; Go: `go`, `golang`; .NET: `dotnet`, `.net`; and custom runtimes: `custom`
- Added runtime validation
- Added Lambda context object with the following properties:
  - `awsRequestId` (Node.js), `aws_request_id` (Python / Ruby) - random GUID string, does not emulate AWS UUID4 request IDs
  - `functionName` (Node.js), `function_name` (Python / Ruby) - identifiable function name string prefixed by `sandbox-`; does not use live production AWS CFN GUIDs
  - `functionVersion` (Node.js), `function_version` (Python / Ruby) - will always be `$LATEST`
  - `invokedFunctionArn` (Node.js), `invoked_function_arn` (Python / Ruby) - always `sandbox`
  - `memoryLimitInMB` (Node.js), `memory_limit_in_mb` (Python / Ruby) - your Lambda's configured memory amount
- `ARC_ENV` is now always set by any Architect runs
- Added ability to specify a project name in `arc create` with `-n` or `--name` parameter
- Added real file paths to (and significantly tidied up) boilerplate HTTP functions created by `arc create`


### Changed

- Arc Create now only write config files (`/path/to/function/config.arc`) if necessary
- Updated dependencies


### Fixed

- Restored `ARC_INTERNAL` env var in Lambda invocations for Arc Functions
- Restored userland env vars to `@sandbox-startup` scripts; thanks @reconbot!
- Fixed case where `@ws` with no `@http` or `@static` would fail to start up; fixes #1234, thanks @reconbot!
- Fixed but where `arc create` might inadvertently attempt to install Architect
- - Fixed `@scheduled` parsing in `app.json` + `package.json` > `arc.scheduled`, thanks @tbeseda!

---

## [9.0.4 - 9.1.0] 2021-09-30

### Added

- Added support for AWS's new Lambda `arm64` architecture via `@aws architecture` setting
  - Default remains `x86_64`
  - Opt into `arm64` in AWS regions that support it


### Fixed

- Fixed manual usage of ASAP in Sandbox by restoring `ARC_SANDBOX_PATH_TO_STATIC` in Lambda env vars; fixes #1231, thanks @andybee!

---

## [9.0.3] 2021-09-28

### Changed

- Sandbox route list now shows automatic static asset delivery at the root as mounting the public folder
- Projects that don't define root handlers will now load static assets from the root much, *much* faster in Sandbox!
- Internal: Sandbox refactor to remove use of environment variables for passing data or config to various internals services, most notably the Lambda execution environment; fixes #1222
  - Lambda executions' env vars are now completely pure and clean, having no extraneous host system env vars
  - Sandbox no longer mutates env vars (with the exception of `ARC_ENV` and `NODE_ENV` if unset or altered by preferences, such as `@sandbox useAWS`)
  - Clean up any non-essential reliance tests may have on env vars previously populated by Sandbox
  - Refactor tests to also stop mutating env vars, and to better clean up after themselves
- Added better support for `ARC_ENV` (instead of relying on / using `NODE_ENV`), helpful for improving reliability when running alongside certain other libraries that mutate `NODE_ENV`
- Removed internal `ARC_HTTP` env var (partly used for Arc v5 backwards compat, which is no longer supported)


### Added

- Sandbox API now accepts a `apigateway` option, in addition to `@aws apigateway` and `ARC_API_TYPE` env var
  - As before, valid options include: `http` (default if not passed), `httpv1`, `rest`
- Sandbox can now be shipped as a binary (should anyone want to do so)
  - Added a new GitHub Actions workflow to per-platform build binary versions (via `pkg`) and run integration tests


### Fixed

- Fixed Sandbox local symlinking issue introduced in 4.0.2
- Fixed faulty error code path during shared file copying in Hydrate

---

## [9.0.2] 2021-09-15

### Changed

- Internal: Updated Architect Parser to v5

---

## [9.0.1] 2021-09-11

### New Architect syntaxes for your favorite text editor!

We just released new Architect syntax definitions for three popular text editors:

– **VS Code** - https://marketplace.visualstudio.com/items?itemName=architect.architect
– **Sublime Text** - still awaiting approval in Sublime [Package Control](https://github.com/wbond/package_control_channel/pull/8363)
  – Manual install (for short-term testing): https://github.com/architect/sublime-package
– **Atom** - https://atom.io/packages/language-architect
– Contribute to the [core Arc syntax definition here](https://github.com/architect/syntaxes)


### Changed

- Updated Sandbox to `ws@8.0.0`
- Improved Sandbox invocation behavior for JS functions where non-async handlers returning a Promise should not fail, thanks @reconbot!
- Improved WebSocket behavior when responding with !`200`; messages now respond with an error message instead of failing silently, thanks @reconbot!


### Fixed

- Fixed Sandbox CLI when parsing larger port numbers (e.g. `--port 33333`); fixes #1023, thanks @filmaj + LumaKernel!
- Fixed inconsistent Sandbox error reporting, thanks @reconbot!
- Fixed issue where specified policies would not be adopted by Lambdas so long as the default role remained intact; fixes #1212
- Fixed issue where multiple layers or policies specified in a single line would lose all but the first
- Disable filesystem watching of `node_modules` and `.git` by default; fixes #1213
- Fixed WebSocket disconnect firing when Sandbox shuts down, thanks @reconbot!
- Fixed issue where changing `@static fingerprint` setting may not update `cache-control` headers in static assets; fixes #1108, thanks @ryanflorence!

---

## [9.0.0] 2021-07-26

### Changed

- The default runtime is now `nodejs14.x` – if your existing functions do not specify a runtime, they will be automatically and seamlessly upgraded from `nodejs10.x` or `nodejs12.x` to `nodejs14.x`.
- Breaking change: removed support for Node.js 10.x (now EOL, and no longer available to created in AWS Lambda) and Node.js 12.x
- Breaking change: in `arc destroy` the `--name` flag can no longer be used in place of `--app` to destroy apps; `--app` must now be used to destroy apps, while `--name` may only be used to destroy stacks
- Breaking change: removed support for deprecated `--nuke` flag in `arc destroy`
- Removed various legacy / deprecated Architect 5 (and lower) code paths
  - This may be a breaking change for the use of individual Architect modules, but Architect itself has no breaking changes related to this code removal
- `arc env` now warns if `ARC_APP_SECRET` is not set in production


### Fixed

- Fixed issue where `REST` APIs relying on ASAP would fail during deploy

---

## [8.7.4] 2021-06-30

### Added

- Added more detailed `context` in Sandbox for WebSocket (`@ws`) requests, thanks @reconbot!

---

## [8.7.3] 2021-06-29

### Added

- Populate Sandbox startup commands (`prefs.arc` `@sandbox-startup`) with `ARC_INV` env var, providing access to the project's Inventory object
  - Please note: Inventory is an internal project enumeration format and may be subject to unexpected change; we have no intentions on altering it in any breaking ways, but we reserve the right to do so without a semver major to Sandbox / Architect


### Fixed

- Ensure Sandbox startup commands respect `cwd`

---

## [8.7.2] 2021-06-23

### Fixed

- Fix Sandbox not terminating handler invocation processes properly if run within Lambda due to Lambda not having *nix `ps`

---

## [8.7.1] 2021-06-22

### Added

- `destroy` now supports a `--no-timeout` flag; the process will block until all application resources are removed (by default, `destroy` times out after 150 seconds regardless of the state of application deletion)

---

## [8.7.0] 2021-06-17

### Added

- Added comprehensive Architect project validation
  - Accelerates development by catches more potential errors before deploying to AWS (and blowing up in CloudFormation, where errors can be difficult to extract)
  - Now also reports multiple project errors instead of just the first error it finds
- Add support for `@tables` `pitr` option, start phasing out `PointInTimeRecovery` option (which is still supported for a while); fixes #1155
- Added `cwd` API param to Sandbox + Hydrate, making it easier to run those modules against one or many mock project directories in tests


### Changed

- Stopped making unnecessary Inventory calls during Sandbox / services startup, Sandbox now starts 10-25% faster most of the time!
- Updated `aws-sdk` to `2.880.0`
- Updated dependencies


### Fixed

- Fixed a bunch of very smol bugs
- Fixed issue where Sandbox CLI might take a long time to reload local routes (or not reload them at all) due to [issues related to Node.js stalling while closing its http server](https://github.com/nodejs/node/issues/2642)
- Fixed issue that could cause `sandbox.http.end()` and `sandbox.events.end()` to hang during tests
- Fixed issue where `@architect/functions` `arc.static()` method may not work if using `@static fingerprint true`, but aren't using `src/shared` or `@static src some-dir`; fixes #1170, thanks @tejaswihidoc!
- Ensure plugin `invokeFunction` has all necessary params, fixes #1162

---


## [8.6.1] 2021-06-13

### Changed

- Updated `destroy` from 1.2.2 to 1.2.4, which improves its behaviour:
  - Detection of application resources which require use of the `--force` flag
      to destroy (i.e. DynamoDB tables or S3 buckets) is done sooner, which
      should reduce the time it takes `destroy` to bail and tell you to use the flag
  - Fixed bug where `destroy` would fail if the application's CloudFormation Stack was already deleted
  - `destroy` will now exit with a non-zero code if any errors occurred during its execution
  - `destroy` will now detect if an application's CloudFormation Stack's status
      becomes `DELETE_FAILED`, and if detected, it will report this as well as
      the reason for it and exit with a non-zero code (previously in this
      situation, it would instead time out after ~3 minutes)

---

## [8.6.0] 2021-05-24

### Added

- Added `@plugins` support for runtime service discovery via use of `variables`
    plugin interface method. Please see the [`@plugins documentation`](https://arc.codes/docs/en/guides/extend/plugins) for more
    details.

---

## [8.5.13] 2021-05-19

### Added

- Added new CLI flags for improved logging – these are rolling out first to Sandbox, and will be introduced into other workflows over the coming weeks
  - `--quiet` (`-q`, `quiet`) - suppresses logging
  - `--verbose` (`v`, `verbose`) - additional Sandbox data related to your userland environment and invocations
  - `--debug` (`d`, `debug`) - debug Sandbox internals (handy for Sandbox development)


### Changed

- Cleaned up Sandbox output when triggering `@events` and `@queues` Lambdae


### Fixed

- Improved file watcher error logging and handling in Sandbox
- Fixed `@static spa` setting in Sandbox; thanks @timmak!

---

## [8.5.12] 2021-05-17

### Fixed

- Fixed issue where Hydrate might get a bit overly aggressive and remove root dependencies during Lambda treeshaking; thanks @ryanbethel!

---

## [8.5.11] 2021-05-11

### Fixed

- Undid change that unnecessarily added Inventory object to WS requests; fixes [#1121](https://github.com/architect/architect/issues/1121), thanks @pgte!
- Fixed an issue where Sandbox wouldn't kill a running Lambda if its configured timeout had expired, fixes [#1137](https://github.com/architect/architect/issues/1137), thanks @andybee!
- Sandbox will now print a warning to the console if any running Lambdas time out

---

## [8.5.10] 2021-04-30

### Added

- Added support for destroying custom stage names (aka stack names), fixes #1055; thanks @filmaj + @ryanbethel!
  - CLI: `arc destroy --app yourappname --name thecustomstackname`
- Added `--now` CLI flag in case you just like really need to destroy stuff right. now.


### Changed

- Should now use `--app` to specify the app to destroy (as opposed to the `--name` CLI flag, which is now used for custom stack names)
  - However, if you don't do this, nothing will be broken; and, of course, `--app` and `--name` can now be used together

---

## [8.5.9] 2021-04-26

### Fixed

- Fixed `views` not hydrating in projects that don't use `shared`; fixes [#1133](https://github.com/architect/architect/issues/1133)
- Fixed bug where plugin-generated Lambdas would not have proper built-in production environment variables assigned when running a production deploy; fixes [#1134](https://github.com/architect/architect/issues/1134)

---

## [8.5.8] 2021-04-23

### Fixed

- Fixed bug introduced in 8.5.7 with switch to async task processing in deploy; fixes [#421](https://github.com/architect/functions/issues/1127)

---

## [8.5.7] 2021-04-22

### Fixed

- Fixed bug where if macros created a copy of the CloudFormation JSON being mutated, that could result in some CloudFormation compilation steps to be ignored; fixes [#1127](https://github.com/architect/architect/issues/1127)

---

## [8.5.6] 2021-04-21

### Fixed

- Fixed hydration of `src/shared` error if multiple lambdas were aliased to a single source location, fixes [#1124](https://github.com/architect/architect/issues/1124)

---

## [8.5.5] 2021-04-19

### Fixed

- Sandbox now supports named `@indexes` (via the `name` parameter), fixes [#1122](https://github.com/architect/architect/issues/1122)

---

## [8.5.4] 2021-04-12

### Fixed

- Fixed hydration of `src/shared` folder to plugin-generated Lambda functions; fixes [#1116](https://github.com/architect/architect/issues/1116)
- Fixed error during `arc destroy` if either `@static` or deployment S3 bucket no longer exists (could happen during a previous `arc destroy` incomplete execution or crash); bucket removal during `destroy` is now idempotent

---

## [8.5.3] 2021-03-25

### Fixed

- Fixed project structure and basic file creation when initializing a fresh new project; fixes [#1078](https://github.com/architect/architect/issues/1078)

---

## [8.5.2] 2021-03-24

### Fixed

- Fixed deployments for legacy REST APIs that do not have a root handler defined; fixes [#1089](https://github.com/architect/architect/issues/1089)
- Error gracefully when new verbose route format is used with legacy REST APIs

---

## [8.5.1] 2021-03-22

### Fixed

- Sandbox now works with an app composed of nothing but WebSockets, fixes [#1099](https://github.com/architect/architect/issues/1099)
- Sandbox can now handle non-JSON a bit more gracefully without blowing up, fixes [#1093](https://github.com/architect/architect/issues/1093); thanks @reconbot!
- Handle multiple cookies according the spec, fixes [#1090](https://github.com/architect/architect/issues/1090); thanks @zaverden!
- Fixed unnecessary warning generated regarding using aws-sdk as a dependency in production; thanks @andybee!

---

## [8.5.0] 2021-03-22

### Added

- Added initial (beta!) support for `@plugins`, fully extensible arc project
    lifecycle interface. Check out [the plugin
    docs](https://arc.codes/docs/en/guides/extend/plugins) for more
    details.

---

## [8.4.11] 2021-03-17

### Added

- Added rough, early internal service discovery endpoint for upcoming neat things


### Fixed

- Fixed `arc init` file creation in projects that use Architect within `package.json`

---

## [8.4.10] 2021-03-02

### Added

- Added support for `name` property in `@indexes` pragma to allow for explicit naming of Global Secondary Indexes; thanks @anatomic!
- Gracefully handle file watcher limit when using `arc sandbox`; thanks @mawdesley!

### Fixed

- Gracefully return an HTTP 400 response if malformed JSON is passed to to the `@events` bus server when using `arc sandbox`.

---

## [8.4.9] 2021-02-28

### Added

- `arc destroy` now removes CloudWatch Log Groups, `arc env`-added environment variables and the S3 deployment bucket when run, in addition to removing the CloudFormation Stack.

---

## [8.4.8] 2021-02-01

### Added

- Added environment's `PYTHONPATH` (if present) to Sandbox Lambda executions, thanks @scoates!

---

## [8.4.7] 2021-01-26

### Added

- New `--no-hydrate` flag to `arc deploy` in case you want arc to skip installing / managing dependencies within functions before a deploy.
- Added `installRoot` param to `@architect/hydrate` API for explicitly enabling root dependencies to be installed
- Added `npx` bin for standalone CLI usage of Hydrate (`npx arc-hydrate`)


### Fixed

- Updated `arc help` text based on latest flags and information, added help text for `logs`
- Fixed `--autoinstall` flag not being detected when running `arc hydrate`
- Fixed Hydrate cleanup on machines that globally disable `package-lock.json`
- Fixed printing correct number of functions to hydrate when Lambda treeshaking is involved

---

## [8.4.6] 2021-01-18

### Fixed

- Fixed crash in Windows on invalid regexp, fixes #1052, thanks @kevin4dhd!
- Fixed minor typo in Sandbox's inaccessible dependency warning; thanks @jeremyw!

---

## [8.4.5] 2021-01-07

### Added

- Added `@sandbox-startup` preferences support, fixes #1032; thanks @rbethel!
- Added ability for `@static` buckets (otherwise enabled by default) to be disabled with `@static false`
- Added new Env prompts:
  - Create a local preferences file if one does not already exist
  - Add or update a `.gitignore` file (if project dir is a git repo)
  - Fixes #1033; thanks @rbethel!

### Changed

- Deprecated the wonky and sometimes broken `@sandbox startup` setting (in favor of the above `@sandbox-startup` pragma)
- Passing options object to Sandbox service methods is now, uh, optional (e.g. `sandbox.http.start()`); thanks @exalted!


### Fixed

- Fixed false positive dependency warnings when Lambda treeshaking encounters a `shared` or `views` directory with its own package.json file and dependencies; thanks @exalted!
- Fixed optional log suppression on a couple startup prints; fixes #1045, thanks @mikemaccana!
- Fixed typo in Deploy error log statement for missing macros

---

## [8.4.3 - 8.4.4] 2020-12-21

### Added

- Added Lambda code payload size report for full deploys

### Fixed

- Fixed regression where `@scheduled` functions may not fire; fixes #1040, thanks @alexbepple!
- Fixed issue where the static bucket URL in the CloudFormation Output was wrong for newer AWS regions; thanks @thedersen!

---

## [8.4.0 - 8.4.2] 2020-12-19

### Added

- Added support for automated dependency management (aka Lambda treeshaking)
  - Simply add all your various Lambdas' dependencies to your root `package.json`
  - During deployment, Architect now inspects each Lambda's `*.js` files (as well as your `shared` and `views` directories) and works out which Node.js dependencies are needed to run
  - Like many tools (such as bundlers), Architect's automated dependency management relies on static analysis of your code
    - As such, if you dynamically generate your `require()` arguments, Lambda treeshaking will not work
    - Your solution in this case is to simply add any necessary `package.json` files to your Lambdas, as has always been possible
  - Currently, Lambda treeshaking is only available for CommonJS dependencies
    - Future support will be added for ES Modules when Lambda adds support for Node.js 14+
  - Existing Lambdas that have their own `package.json` files will continue to work as they always have
    - To let Architect take over, remove your `package.json` files, and make sure the appropriate dependencies are installed in root


### Changed

- Sandbox out of bounds dependency warnings are now updated and limited to take into account Lambda treeshaking
- De-uglified various Sandbox error views
- Deploy artifact cleaner now makes a best effort run after every deployment, whether or not it succeeded


### Fixed

- Added missing dependency hydration step to direct deploys
- Fixed inability to deploy static asset-only apps; thanks @thedersen!
- Fixed Sandbox formatting in unknown `@http` userland error state
- Fixed Hydrate `npm` + `yarn` calls potentially installing developer dependencies in Lambdas; fixes #1034, thanks @BenoitAverty!
- Fixed alternative handler file checks when using Deno; fixes #1022
- Fixed middleware handling `ARC_SANDBOX_ENABLE_CORS`; thanks @neilhoff!
- Fixed serving bare `@static` (i.e. S3-only with no `@http`) apps; fixes #1031, thanks @dam!
- Fixed issue where longer `@scheduled` function names would fail to deploy due to funky SAM transform behavior; thanks @gmartins, fixes #1038
- Fixed issue where `@http any /*` could clobber the ability to send `@ws` messages locally; fixes #1039, thanks @mikemaccana!

---

## [8.3.7] 2020-12-09

### Fixed

- Fixed inaccurate `HTTP` API payload or legacy (`REST`) fallback in certain circumstances

---

## [8.3.6] 2020-12-03


### Added

- Added support for new `@shared` pragma with selective shared code, uh, sharing
- Added support for custom shared + views file paths
- Added global preferences lookup (`~/.preferences.arc` + `~/.prefs.arc`, etc.) and global / local preference merging; thanks @andybee + @exalted!
- Added Create support for custom templates in paths outside the project directory (e.g. `~/tmpl/http.js`, `../../tmpl/http.js`); thanks @andybee!
- Added response payload size validation; `@http` Lambdas with >6MB responses will now fail gracefully; thanks @andybee!


### Changed

- Removed occasional unnecessary printing of static asset deploy status


### Fixed

- Fixed obscure circumstance where moving or deleting a symlinked shared or views folder can crash hydration
  - Shared file copier now always deletes destination file dirs before writing instead of checking existence (which may result in false negatives for existence
- Fixed potential for empty files to be written to disk during Create initialization should a custom template not be found

---

## [8.3.5] 2020-11-30

### Fixed

- Fixed broken `@tables stream` documentation link in Create (which will be added back in later!), thanks @filmaj!

---

## [8.3.4] 2020-11-29

### Fixed

- Fixed bug where `NODE_ENV` would not be updated to `production` if `production` environment had no userland env vars; thanks @barryf!

---

## [8.3.3] 2020-11-28

### Changed

- Internal change: moved ASAP + fingerprinting from Package into Deploy (finally)


### Fixed

- Fixed `fingerprint` check that could cause false negative fingerprinting
- Improved reliability of direct deploys; thanks @filmaj!
- Gracefully fail when Sandbox startup script does not supply sufficient arguments; partially fixes #1019, thanks @filmaj!
- Fixed Logs queries on Lambdas with custome file paths; fixes #1020, thanks @filmaj!

---

## [8.3.1 - 8.3.2] 2020-11-25

### Fixed

- Fixes env var population when Deploy is run via CLI, thanks @herschel666!
- Fixed double banner print when being called from `@architect/architect`
- Fixed direct deploys when project does not have an explicit @http root handler, thanks @filmaj!
- Fixed WebSocket API failure related to AWS bug; fixes #1015, thanks @filmaj!

---

## [8.3.0] 2020-11-16

### Added

- Added support for custom file paths in all function types
- Added support for new local preferences (`preferences.arc` or `prefs.arc`) file
  - Add Sandbox preferences with `@sandbox`
    - `@env` (generated by running `arc env`, or added manually) populates environment variables
  - Example:
```arc
@sandbox
startup
  echo 'Hi there!'
  npm run test
  node some/arbitrary/script.js

@env
testing
  AN_ENV_VAR somethingUseful
```
- Added Sandbox `.env` support; thanks @wesbos!
- Added support for direct deploys of multiple functions from a single source dir (with custom file paths)
- Added support for direct deploys to production Lambdas
- Added support for ensuring environment variables are updated during direct deploys
- Gave Env a much needed makeover! Some highlights:
  - Added support for `preferences.arc` (and `prefs.arc`)
  - Added support for `.env`
  - Only prints the environment whose variables were changed (making it easier to see what happend in projects with lots of env vars)
  - Exit gracefully instead of erroring when removing an env var that doesn't exist
- Added support for custom default templates, thanks @Ankcorn!
  - Add per-pragma custom templates via the Arc preferences file, example:
```arc
@create
templates
  http path/to/template/http.js
  events path/to/template/events.py
```
- Added missing Lambda handler error in Sandbox, and made ever so slightly nicer the error message presentation
- Added support for `ARC_ENV` default env var
- Added ability to define JSON-formatted Architect manifest in `package.json` (via `arc` or `architect` param)


### Changed

- Breaking change on the Sandbox startup init script beta: existing startup scripts have replaced by startup preferences (`@sandbox startup`, see above)
  - `scripts/sandbox-startup.[js|py|rb]` must now be executable and callable from a shell via startup preferences (e.g. `node scripts/sandbox-startup.js`)
- Implemented Inventory (`@architect/inventory`)
- Removed legacy (and I do mean *legacy*) auto-initialization of `arc-sessions` table from Arc <5
  - Still initializing `{appname}-{env}-arc-sesssions` tables, though
- An inventory object is now passed as the 4th parameter to Macros; please note that this is (for now) considered internal-only and may change in the future
- Added more (hopefully) helpful environment-related init logging in Sandbox:
  - Which environment is being loaded
  - Whether Sandbox found any env vars for the current environment
  - Whether Sandbox is using any live AWS infra (via prefs or `ARC_LOCAL`)
- Deprecated Env writing to `.arc-env` file
- Sandbox and Deploy no longer create missing Lambda resources by default; to reenable that, add to your preferences file:
```arc
@create
autocreate true
```


### Fixed

- When using Yarn, detect local vs global installs, and prefer local installs where found (via `npx` call)
- `updater` errors now include stack traces
- Fixed static deployments on apps with enough CloudFormation resources to paginate; fixes #996, thanks @samirrayani!
  - Also fixed direct deployments on apps with enough CloudFormation resources to paginate
  - Also fixed logs calls on apps with enough CloudFormation resources to paginate; thanks @tobytailor + @filmaj!
- Fixed case where explicitly defining `@cdn false` does not disable the CDN; fixes #968
- Fixed bug where Deploy would crash instead of bubbling a CloudFormation error
- Fixed non-exiting CLI process when an error occurs
- Fixed wonky order of env population message printing in Sandbox
- Fixed Hydrate creating empty folders with `node_modules` / `vendor` dir when auto-creation is disabled and a Lambda folder isn't found
- Fixed issue where Logs wouldn't get log data from DynamoDB streams Lambdas; thanks @filmaj!

---

## [8.2.1] 2020-10-27

### Fixed

- Fixed issue where API Gateway `HTTP` routes using `any` would not respect using Lambda payload format v1.0 (and would fall back to v2.0 mode)

---

## [8.2.0] 2020-10-26

### Added

- Added support for CloudFormation's new 500 resource limit! This makes us very happy! You can now ship much larger Architect projects.


### Changed

- Removed check for >200 CloudFormation resources, and Package's related `nested` CloudFormation code path
  - This obscure CloudFormation generation path was not supported or maintained, and was intended for testing / internal use only
  - If for whatever reason you did rely on this previous implementation **you should not upgrade to 8.2.0**
  - Related, removed internal `.toSAM` and `.toCFN` methods in Package

---

## [8.1.0] 2020-10-15

### Added

- Added support for symlinking shared code into functions (`src/shared` and `src/views`), which vastly improves Sandbox performance
  - Large projects utilizing shared code will see a 10-50x performance improvement on startup, and changes to shared code are now instantly reflected across all local functions
  - To drop back into file-copying mode, invoke sandbox with `--disable-symlinks` (or if using Sandbox via API, pass `symlink: false` in your options object)
  - If you are using `@static fingerprint true`, you will see a symlinked `static.json` in your `src/shared` folder. Feel free to add it to your .gitignore; while it isn't hurting anything, it will be dealt with in a future release
  - Legacy Windows operating systems that don't support symlinking will continue to copy shared code upon startup like some kind of hethen
  - Shout out to @joliss!

---

## [8.0.2 - 8.0.3] 2020-10-13

### Fixed

- Sandbox now responds to requests to root with only `/:param` defined in `HTTP` APIs, fixes #981
- Improved root handling + ASAP fallthrough behavior in Sandbox
- Fixed obscure false negative for adding Arc Static Asset Proxy when `@http` contains a route that looks like `get /:hey/there`
- Fixed parsing of duplicate query string params in Sandbox deprecated (Arc v5) mode
- Fixed Sandbox shutdown errors when using an external local DB, thanks @herschel666!
- Fixed Sandbox issue where default region may prevent connections to external local DB, thanks @exalted!
- Fixed Sandbox issue where WebSocket send events may fail in `HTTP` mode, thanks @grncdr!
- Fixed Sandbox issue where paths with a param and catchall (e.g. `/:item/*`) had malformed request payloads, fixes #983

---

## [8.0.1] 2020-10-10

### Fixed

- Improved reliability of deploying static assets in Windows
- Fixed static asset deployments with fingerprinting enabled in Windows, fixes #782

---

## [8.0.0] 2020-10-08

### Added

- Added support for `@http` catchall syntax (e.g. `get /api/*`)
  - The catchall syntax allows you to greedily capture requests anywhere beneath path part(s) specified
  - Compare to parameters, which only catch requests at one path level (e.g. `get /api/:call` can't catch get requests to `/api/category/items/item`)
  - Note: this is currently only supported for `HTTP` APIs, and is not currently supported in Architect for legacy `REST` APIs
  - Fixes #969
- Added support for `@http` `head` + `options` methods
  - Fixes #760 (even though it was already closed but so what)
- Added support for `@http` `any` method syntax (e.g. `any /path`)
- Added support for `@proxy`
- Added basic `requestContext` to `REST` API requests


### Changed

- Breaking change: with the addition of `@http` `any` and `*`, default `get /` greedy catchall is now deprecated
  - To restore that behavior, either move your `get /` route to `any /*`, or just define a new `any /*` route
- Removed support for `arc repl` – a quite old and not broadly used local workflow querying DynamoDB

---

## [7.0.7] 2020-10-08

### Fixed

- Fixed issue where projects with `@ws` fail to start up in Sandbox, thanks @grncdr!

---

## [7.0.6] 2020-10-06

### Changed

- Removed Sandbox startup notice regarding Sandbox defaulting to `HTTP` API emulation mode


### Fixed

- Fixed regression when using a non-Sandbox DynamoDB instance via the `ARC_DB_EXTERNAL` env var, thanks @herschel666 & @m-butler!

---

## [7.0.5] 2020-09-30

### Fixed

- Fix issue where `app.arc` manifests may be overwritten by template initializer

---

## [7.0.4] 2020-09-29

### Changed

- Updated dependencies


### Fixed

- Fix remaining `.arc` file references to `app.arc` when performing `npm arc init`

---

## [7.0.3] 2020-09-21

### Fixed

- Fixed paths in `@cdn` origin configuration; fixes #965, ht @anatomic
- Fixed legacy API binary encoding deploy-time patching

---

## [7.0.0 - 7.0.2] 2020-09-17

Hooray, Architect 7 (Chupacabra) is here, and `HTTP` APIs are now the default when provisioning new API Gateway resources! ✨

tldr – if you have an existing Architect 6 project:
- **You can continue to safely deploy that project with Architect 7 (Chupacabra)**
- No breaking infrastructure changes will be applied by Architect 7 unless manually and explicitly opting in
- However, it is possible **Sandbox may be broken for your local workflows and testing**
  - If so, you'll need to **add a new setting API type setting** – [see the upgrade guide](https://arc.codes/guides/upgrade#architect-7-breaking-changes)

Please see the full [Architect 6 → 7 upgrade guide](https://arc.codes/guides/upgrade) for detailed information.


### Added

- `HTTP` APIs are the new default when provisioning API Gateway resources
  - Existing projects with API Gateway `REST` APIs will remain unchanged and can continue to deploy safely
  - New apps will default to using `HTTP` APIs (but can be configured as `REST` APIs)
  - API type configuration:
    - Valid settings: `http` (default), `httpv2` (aliased to `http`), `httpv1`, and `rest`
    - `http` + `httpv2` uses the latest API Gateway payload format
      - If you'd like to use `HTTP` APIs with code authored for an existing `REST` API project, manually specify the v1.0 payload format with `httpv1`
        - Note: **this is a partially destructive change**, as it would result in new API Gateway URLs being generated, and your old URLs being deactivated. If not accounted for, this may result in downtime
      - Apply in `deploy` CLI with `--apigateway http[v1|v2]|rest`, or in project manifest with `@aws apigateway http[v1|v2]|rest`
    - Backwards compatibility for `REST` APIs is retained with `rest` setting
      - Apply in CLI with `--apigateway rest`, or in project manifest with `@aws apigateway rest`
  - This only impacts Architect `@http`, which was formerly provisioned as `REST` APIs
  - More info: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html
  - Fixes #838
- API Gateway `HTTP` APIs as the new default API type in Sandbox **may be a breaking change for local workflows with existing projects**
  - If so, per above, make sure you set to `REST` mode with `ARC_API_TYPE=rest` or add that configuration to your project manifest
  - Existing projects with API Gateway `REST` APIs will remain unchanged and will continue to deploy safely, even though Sandbox now defaults to `HTTP`
- Added unified service interface and nascent API for Sandbox modules
- Sandbox itself and its various service modules (`http`, `events`, and `tables`) now have a consistent API to improve using Sandbox in your test suites
  - All Sandbox module methods now accept an options object, and can either return a Promise (e.g. can be used in async/await), or accept an optional callback
  - Additionally, all Sandbox module methods now properly set their own environment variables, hydrate any necessary dependencies, and handle any other necessary service startup routines
  - `sandbox.start()` and `.end()` start and end all Sandbox services:
    - `sandbox.start(options[, callback]) → [Promise]`
    - `sandbox.end([callback]) → [Promise]`
  - `http.start()` and `.end()` starts and ends just the HTTP / WebSocket service:
    - `http.start(options[, callback]) → [Promise]`
    - `http.end([callback]) → [Promise]`
  - `events.start()` and `.end()` starts and ends just the event bus service:
    - `events.start(options[, callback]) → [Promise]`
    - `events.end([callback]) → [Promise]`
  - `tables.start()` and `.end()` starts and ends just the local DynamoDB service:
    - `tables.start(options[, callback]) → [Promise]`
    - `tables.end([callback]) → [Promise]`

### Changed

- Removed experimental support for `@http` static mocks
- Several seldom used and largely undocumented Sandbox module APIs have breaking changes:
  - `sandbox.start()` no longer returns a function to shut down, and should now be shut down directly with `sandbox.end()`
  - `sandbox.db()` is now `sandbox.tables()`
  - `http.close()` is now `http.end()`
  - `events.start()` & `tables.start()` no longer return server objects to be invoked with `.close()`, and should now be shut down directly with `events.end()` and `tables.end()`


### Fixed

- Fixed issue where Lambda timeouts were only respected if >3 seconds; now >=1 second is valid
- Refactored Arc v6 response support for `multiValueHeaders` to better accommodate use cases where `headers` & `multiValueHeaders` are not in conflict with each other
- Fixed issue where in certain circumstances legacy (`REST`) APIs could be provisioned without `/_static`
- Fixed issue where legacy (`REST`) APIs stage names was incorrectly set for production

---

## [6.6.6] 2020-09-14

Sorry, the dark lord demanded that we bump to `6.6.6` for the final Arc 6-series release!

### Added

- Added explicit `statusCode` parameters to all boilerplate code responses for forward compatibility with API Gateway HTTP APIs


### Fixed

- Un-break Lambda invocation if a list (example: multiple items under `layers`) is present in a Lambda's `.arc-config` file
- Fixed Deno issues on Windows (and added Deno to CI + integration tests), /ht @petruki

---

## [6.5.5] 2020-08-27

### Fixed

- Fixed `process.stdin.setRawMode is not a function` error that may occur in certain circumstances when running Sandbox; thanks @kristoferjoseph!

---

## [6.5.4] 2020-07-15

### Added

- Added (exprimental) support for manual rehydration while running:
  - Press `shift` + `H` to rehydrate all shared files
  - Press `shift` + `S` to rehydrate src/shared
  - Press `shift` + `V` to rehydrate src/views
  - Fixes #902, ht @andybee!


### Fixed

- Fixed static asset deploy path issue; fixes #915, ht @gykapur!
- Fixed `.arc-env` encoding of env vars with Architect-reserved characters

---

## [6.5.3] 2020-07-01

### Changed

- Apps now ensure least privilege HTTP methods on `/_static/*`, allowing only `GET`


### Fixed

- Improves compatibility with production REST API behavior for non-get requests to root; fixes #900 /ht @andybee
- Fixed API Gateway issue that adds an extra stage called `Stage`
- Corrected internal configuration for static proxy

---

## [6.5.2] 2020-06-25

### Changed

- Static asset deployments now rely on MD5 hashes for static asset diffing, and not filesystem `mtime`; fixes #890

---

## [6.5.1] 2020-06-24

### Added

- Added experimental Sandbox support for manually opting into [AWS's Java-based local DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html); thanks @m-butler!

---

## [6.5.0] 2020-06-23

### Added

- Adds `arc destroy` command: destroy your Architect projects with Architect
  - Run `arc destroy --name your-app-name` to destroy apps without static assets or database tables
  - Run `arc destroy --name your-app-name --force` to force-destroy apps with static assets and/or database tables (resulting in permanent data destruction, if you did not back them up)
  - Fixes #430 (finally!)
- Rewrite of static asset S3 publishing
- Adds support for `@static fingerprint external`
  - Use this with an existing frontend framework that handles its own fingerprinting
  - This setting ensures `static.json` won't be generated, but that files delivered will get long-lived caching headers
- Added the ability to prefix static deploy paths with `@static prefix whatever`
- Added more comprehensive support for static asset pruning, including ability to prune from a full deploy (e.g. `arc deploy --prune`)
- Respect `@static spa` setting in root proxy (i.e. `@http` without `get /`); fixes #816
- Default root proxy now coldstarts faster by removing any globally defined layers
- Added layer region validation (instead of letting CloudFormation fail without a helpful error)
- Added Sandbox support for `@static spa true|false`


### Changed

- Default Architect project manifest filename is now `app.arc` (changed from `.arc`)
  - All existing projects are unaffected by this change, and will always support `.arc`
  - Fixes #805
- Sandbox header casing now matches API Gateway (read: everything is lower-cased); fixes #793
- Sandbox support for Deno updated for `1.0.5`+
  - Entry now looks for `index.{js,ts,tsx}` and `mod.{js,ts,tsx}`
  - Sandbox now forces reload every Deno invocation
- Internal change: implemented new code standard with `@architect/eslint-config`


### Fixed

- Sandbox response headers are now remapped (and in some cases dropped) per observed behavior in API Gateway
  - Worth noting, this follows *actually observed* API Gateway behavior; what's published in their docs (link below) has been known to differ from reality
  - https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-known-issues.html
  - Fixes #879; /ht @andybee
- Fixed duplicate generation of table attribute definitions, fixes #828; thanks @filmaj! /ht @exalted
- Sandbox's WebSocket `connectionId` was getting overwritten by concurrent client connections
  - Sending a message to a `connectionId` before it has connected should emit a `GoneException`
  - Fixes #818; ht @andybee for helping track this down!
- Fixed `@aws` configuration in root project manifest and `.arc-config`, especially pertaining to the use of `layer` or `layers`; fixes #852, ht @jessrosenfield!
- Fixed file pruning for projects with `@static folder` specified
- Sandbox now checks to ensure `@static folder` exists, and errors if not found
- Fixed `@static fingerprint ignore` with more recent versions of Architect Parser
- Fixed Sandbox proxy lookup to custom 404 pages
- Fixed incorrect filename in proxy 404 error message
- Fixed exit condition of fingerprinter when no files are found
- Fixed `@static fingerprint ignore` with more recent versions of Architect Parser
- Fixed unsetting `@tables encrypt` setting locally; fixes #785, thanks @filmaj! /ht @m-butler

---

## [6.4.1] 2020-06-09

### Added

- Added layer region validation (instead of letting CloudFormation fail without a helpful error)


### Fixed

- Fixed `@aws` configuration in root project manifest and `.arc-config`, especially pertaining to the use of `layer` or `layers`; fixes #852, ht @jessrosenfield!

---

## [6.4.0] 2020-05-17

### Added

- Deploy can now deploy directly deploy single functions or groups of functions to Lambda by providing a path; examples:
  - `arc deploy src` will dirty deploy all of `./src`
  - `arc deploy src/http` will dirty deploy all of `./src/http`
  - `arc deploy src/events/foo` will dirty deploy `./src/events/foo`
  - As a reminder: direct deployments should be considered temporary / for testing only, and will be overwritten by any deployments coming in from a proper full deploy operation
  - Fixes #625, shout out to @filmaj for this awesome feature! 🔥
- Adds Yarn support to Sandbox and Hydrate
- Improved default caching behavior for static assets; fixes #273
  - Any assets that don't have `cache-control` explicitly set will now default to using `ETag` in order to improve the reliability of cache invalidation
  - HTML & JSON responses still default to anti-caching headers
- Added path peeking (aka pretty URLs); fixes #269
  - URLs delivered via `proxy` no longer require a trailing slash!
  - Example: to load `/foo/index.html`, you used to have to request `/foo/`
  - Now, if `/foo` is requested, `proxy` will automatically try peeking into `/foo` to see if it contains `/foo/index.html` – if not, it'll 404 as expected
- Added ETag support to Sandbox static asset serving
- Adds Sandbox support for `multiValueHeaders` in response object; fixes #764, thanks @andybee!
- Added support for arbitrary static asset config mapping
  - Pass proxy `config.assets` a `static.json`-like static asset object
- Added support for configuring `ruby2.7` and `dotnetcore3.1` runtimes


### Changed

- If creating a FIFO queue, set `ContentBasedDeduplication` to be enabled by default; thanks @filmaj!


### Fixed

- Fixed an issue where `multiValueHeaders` may conflict with `headers` values for `Content-Type`; thanks @andybee!
- Fixed an issue where errors weren't being handled if the database port conflicted on startup; thanks @exalted!
- Custom `@aws` WebSocket routes will now have their dependencies correctly hydrated, thanks @mawdesley!
- Fixed Sandbox error `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM` in Node.js 14; fixes #780, ht @stegosource
- Fixed issue where `404` responses delivered from `@static` may be inadvertently cached by CDNs

---

## [6.3.5] 2020-04-18

### Added

- Added Sandbox watcher pausing
  - The presence of `_pause-architect-sandbox-watcher` in your operating system's `$TMP` directory (usually `/tmp` or `c:\windows\temp`) will temporarily pause the Sandbox watcher
  - This means Sandbox can remain open during deploys and neither `arc sandbox` or `arc deploy` should interfere with the other's dependency hyration
  - This is also useful when combined with tools like `lint-staged` to ensure automated file stashing within `src/shared` and `src/views` doesn't result in hydration failures
  - Sandbox cleans up this file on startup, jic
- Allow Architect's CDN checks / processes to be disabled
  - This means you can now configure and manage your own CDNs entirely via Macros; fixes #750, thanks @jgallen23!
  - Syntax: `@cdn false` || `@cdn disable` || `@cdn disabled`


### Changed

- Improved Sandbox's missing dependency warnings to provide better instructions on how to install a missing dependency if the function in question does not already have a `package.json` file; /ht @exalted


### Fixed

- Fixed issue where explicit (or empty) returns in functions would provide a red herring error
- When a non-existent `@events` Lambda is invoked, Sandbox will now gracefully fail
- Updated dependency status checker, fixes false positive rehyhdration of packages installed by archive or git repo
- Fixed issue where custom named deployments (`deploy --name`) wouldn't work with `static`; fixes #759, thanks @jgallen23!
- Fixed issue where deploying static assets may deploy to the wrong bucket if additional buckets are defined in Macros; fixes #750, thanks @clintjhill + @jgallen23!

---

## [6.3.4] 2020-04-10

### Fixed

- Sandbox (and other workflows) should now restore the terminal cursor more reliably when quit
- Sandbox now preserves leading / trailing whitespace in console logs
- Fixed issue where `.arc-config` files with an `@aws timeout` value of exactly `900` (15 minutes) would not be respected in Sandbox

---

## [6.3.3] 2020-03-31

### Added

- Adds Sandbox warning for out of bounds dependency loads
  - This helps to ensure that potential side effects of running Node.js locally – such as the `require` algorithm traversing the filesystem outside the boundaries of the function in question – are less likely to be discovered after deploying to live AWS infra


### Fixed

- Updated the call that starts Sandbox to ensure it initiates the filesystem watcher

---

## [6.3.2] 2020-04-10

### Fixed

- Fixed bug with static mocks in Package

---

## [6.3.0 - 6.3.1] 2020-03-24

### Added

- Added early support for deploying API Gateway HTTP APIs (currently only via [Macro](https://github.com/architect/arc-macro-http-api))
- Lambda's payload size limits are now respected and mocked in Sandbox; payloads exceeding 6MB will fail to execute, as they would in AWS


### Changed

- If `@http` is defined, a static bucket will now be automatically be created
  - `@http` makes `@static` implicit; `@static` still serves to configure static asset hosting
  - If you don't use `@http` you can still use `@static` to independently create and configure static asset hosting
- Updated `http-proxy` to support API Gateway HTTP APIs (say that three times fast)


### Fixed

- Fixed Sandbox issue where HTTP requests with large body payloads error with E2BIG; fixes #639, /ht @dawnerd

---


## [6.2.5] 2020-03-19

### Changed

- Architect now falls back to a very basic default project if an Architect project manifest file is not found in the root of the working directory
- Requests in Sandbox that include query string arrays like `?ids=1&ids=2&ids=3&ids=4` are now consistent with API Gateway's request `multiValueQueryStringParameters` property; thanks @defionscode!
- Deploy now ensures dependency hydration occurs before macros in the deploy process, enabling macros to mutate dependencies and shared files during a deploy
  - A nice example macro to use is `@architect/arc-macro-node-prune`, which tidies up all the junk in your functions' `node_modules` directory
- Minor improvements to auto-generated boilerplate function files


### Fixed
- `.arc-env` env vars now support a wider variety of special characters (such as `+`, `@`, `#`, etc.) if quoted, e.g. `FOO "sp#ci@lch+rs"`; fixes #638
- Fixed Architect project manifest syntax errors and error reporting

---

## [6.2.4] 2020-02-29

### Added

- Added mocking of AWS's `multiValueHeaders` into Sandbox requests
- Also added mocking of the headers AWS drops from requests


### Fixed

- Fixes differences in Sandbox between AWS's inconsistent header casing and our existing lowcase-normalized header casing; fixes #698

---

## [6.2.1 - 6.2.3] 2020-02-13

### Changed

- Sandbox now ensures `NODE_ENV` is one of `testing`, `staging`, or `production` (defaulting to `testing`)
- Fix bad SQS in CloudFormation
- Updates deps


### Fixed

- Fixed issue in Sandbox where pulling changes down with git (or Mercurial) would not trigger filesystem changes (e.g. auto-hydration, etc.); fixes #673
- Removed validation from setting your app's environment variables (e.g. `arc env testing FOO bar`), use whatever you like! Fixes #669, thanks @rbuckingham!
- Fixed issue within Architect Functions that caused issues in certain test harnesses that automatically set `NODE_ENV`
- Fixed issue that may cause Sandbox to stall when called via the Architect CLI

---

## [6.2.0] 2020-02-04

### Added

- Added support for running multiple Sandboxes at the same time; fixes #635
  - No more conflicting events and ports when running multiple simultaneous local Architect projects
  - Also, you can now manually configure your `@events` port with `ARC_EVENTS_PORT`, and `@tables` port with `ARC_TABLES_PORT`
  - Note: while unlikely, if you already manually specify your Sandbox's port, this may be a breaking change to your local workflow in two circumstances:
    - 1) You use Architect Functions; to fix, upgrade to Functions `3.6` or later
    - 2) You hardcode an `@events` client to port `3334` or DynamoDB client to port `5000`; you should now read the ports from `ARC_EVENTS_PORT` and `ARC_TABLES_PORT`
    - This change is **NOT breaking to any live AWS / production infra**
- Deploy dry-run flag: `deploy --dry-run`; fixes #649
  - Test your `@macros`, function hydration, CloudFormation / SAM template files, and other deployment-related operations without actually building any live infra
  - Dry-run mode runs through all deploy operations necessary to generate your app's CloudFormation / SAM template files
  - **Heads up:** the AWS CLI requires a live, active S3 bucket to generate your app's templates; however no **live infra will be created** from these templates


### Changed

- Update dependencies


### Fixed

- Fixed Sandbox issue where DynamoDB (and other `aws-sdk`) calls may time out if a `~/.aws/credentials` file is not present
- Fixed issue with shared code hydration in `python3.8`; fixes #650, thanks @rbuckingham!
- Added support for `deno` in `utils.getRuntime`

---

## [6.1.9] 2020-02-03

### Added

- Better support for quiet mode in Sandbox:
  - Via params: `sandbox.start({quiet: true})`
  - Via env vars: `ARC_QUIET` (or legacy `QUIET`)
  - Fixes #621; thanks @konsumer!
- Adds discrete `sandbox.end([callback])` method for shutting down the Sandbox in test environments
  - This method takes an optional callback or returns a promise
- Sandbox now sets the `ARC_CLOUDFORMATION` env var used by Architect Functions and other libs
  - This only occurs when running Sandbox against live infra (specifically: `NODE_ENV` = `staging` || `production`),


### Changed

- When called as module, `sandbox.end` now calls an optional callback or returns a promise; fixes #622, thanks @konsumer!
- Sandbox now only starts the `@events` + `@queues` bus and `@tables` DB when called for by the Architect project manifest


### Fixed

- Improved logging for WebSocket invocations to be less confusing about potential non-error states when message action not found; fixes @sandbox#228

---

## [6.1.8] 2020-01-29

### Added

- Added `--static` flag to init to create a basic static asset app (instead of one with a `@http get /` function)
  - Example: `arc init --static ./myapp` or `npm init @architect --static ./myapp`


### Fixed

- Fixed Sandbox issue with secondary index (`@indexes`) naming schemas first introduced with Architect 6; fixed #45, thanks @eshikerya & @konsumer


### Changed

- The default `.arc` file generated in new projects no longer includes a boilerplate for `@aws bucket`
- Updated dependencies

---

## [6.1.6 - 6.1.7] 2020-01-24

### Added

- `@queues` are FIFO by default now; you can opt-out with `.arc-config` `fifo false`
- `arc.queues.publish` will now accept a `groupID` parameter for ordering within a FIFO queue
- Read more about queues! https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html

### Fixed

- Queues will sync VisibilityTimeout to the Lambda timeout

---

## [6.1.5] 2020-01-23

### Fixed

- Fixed local WebSocket port in `ARC_WSS_URL` in Sandbox

---

## [6.1.4] 2020-01-22

### Added

- Added `ARC_WSS_URL` env var on Sandbox startup (matches the environment variable behavior of Architect 6.0.25); fixed #225


### Changed

- Updated default Lambda runtime to match AWS's default: `nodejs12.x` (formerly `nodejs10.x`); fixed #609
  - This means that upon your next deploy, any Lambdas that do not have a runtime specified will automatically be updated to `nodejs12.x`
  - If you rely on the default runtime selection and would prefer to retain Node.js 10, you can either:
    - Add `runtime nodejs10.x` to the `@aws` pragma of your Architect project manifest (`.arc`)
    - Add a `.arc-config` file to the root of any individual functions you'd like to continue using `nodejs10.x` and add the same `@aws` pragma config specified above
    - Read more here: https://arc.codes/reference/arc-config/runtime
    - Quick example:
```
# .arc || src/http/get-index/index.js
@aws
runtime nodejs10.x
```
- Updated dependencies

---

## [6.1.3] 2020-01-21

### Fixed

- Fixes issue with hydration of shared code in functions using `nodejs12.x`; thanks @bardbachmann!


### Updated

- Update dependencies

---

## [6.1.2] 2020-01-20

### Added

- A `PointInTimeRecovery` attribute may now be added to tables defined in `.arc` for DynamoDB point-in-time recovery support; thanks @defionscode!

---

## [6.1.1] 2020-01-18

### Added

- An `encrypt` attribute may now be added tables defined in `.arc` for DynamoDB encryption support using customer or AWS managed KMS keys; thanks @defionscode!

---

## [6.1.0] 2020-01-13

### Added

- Finally: Architect now automatically creates a deployment bucket if one is not specified!
  - If you already have a deployment bucket specified, nothing changes; Architect will continue using that
  - If a deployment bucket was automatically created in a prior deployment and now no longer exists (or access to it is no longer available), a new bucket will be created and your app's configuration will be updated
  - This also means the `@aws` pragma is no longer strictly necessary to deploy to AWS with Architect; you can now work completely from a `~/.aws/credentials` file or env vars


### Fixed

- Allow reading and destroying logs from `ws` paths; fixes @architect#538 + @logs#98, ht @jessehattabaugh, thanks @austinkelleher!
  - Additionally fixes destroying from paths that include `000`

---

## [6.0.29] 2020-01-07

### Added

- AWS credentials can now be loaded via env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`), which enables AWS STS and tools such as [AWS Vault](https://github.com/99designs/aws-vault)
  - Thus, Architect no longer requires a `~/.aws/credentials` file to run
  - Also allows local creds file to be overriden by env vars by specifying `ARC_AWS_CREDS=env`
  - Also added AWS session token support via setting `AWS_SESSION_TOKEN` env var
  - Fixes `utils` #26; thanks @ryan-roemer!
- Enabled AWS `credential_process` usage via improved credential handling; fixes #582 thanks @defionscode!


### Fixed

- Credentials are now properly backfilled with dummy values for various workflows
  - This ensures certain specific workflows (such as local Sandbox usage with `@tables`) won't crash or stall without a valid `~/aws.credentials` file present
- Fixed Sandbox errors related to missing `aws-sdk` dependency


### Updated

- Updated dependencies

---

## [6.0.28]

FIXME

---

## [6.0.27]

FIXME

---

## [6.0.26] 2019-12-13

### Added

- Sandbox now passes full request params from WebSocket clients on `connect` and `disconnect`
  - Now in addition to `request.requestContext.connectionId`, you'll have `request.headers`, and `request.queryStringParameters` (if present)
  - Sandbox now only passes `request.body` to WebSocket functions that receive `message`s (instead of adding an empty `body` object to all requests)
- Added proper emulation of API Gateway v2's WebSocket connection authorization
  - Returning an object containing `statusCode` 2xx allows a WebSocket client to connect
  - Returning any other status code will hang up on the request

---

## [6.0.25] 2019-12-02

### Changed

- Now prints WebSockets URLs upon deployment, thanks @jessehattabaugh!


### Fixed

- Fixes regression related `staging` and `production` WebSockets names and paths, thanks @jessehattabaugh!
  - WebSockets APIs named `${appname}Websocket` are now named `${appname}Websocket${stage}` (like `@http` APIs)
  - `production` WebSockets paths now correctly reflect the production stage (e.g. `longawsurl.com/production`)
  - If you're using the `ARC_WSS_URL` env var, be sure to also update `@architect/functions`

---

## [6.0.24] 2019-12-02

### Added

- Adds `CAPABILITY_AUTO_EXPAND` for nested stack deployments; fixes #436, thanks @jgallen23!

---

## [6.0.23] 2019-11-19

### Added

- Added support for `nodejs12.x`, `python3.8`, and `java11` runtimes


### Changed

- Updated dependencies


### Fixed

- Fixed printing of unnecessary ANSI escape characters in CI environments (`CI` env, or not TTY output)

---

## [6.0.21] 2019-11-19

### Fixed

- Adds `ArcWebSocketPolicy` to the generated IAM Role
- Adds `ARC_WSS_URL` environment variable to all Lambdas if `@ws` is defined
- Fix `.arc-config` properties: `layers` and `policies`
  - Adding one layer or policy per line: `layers my:arn:here` or `policies my:arn:here`
  - Adding ARNs as a list (two spaces indented below `layers` or `policies`)
  - eg:

```arc
@aws
layers
  my:arn:here
  my:other:arn:here
```

### Removed

- Generated CloudFormation template output value `WSS` is now a plain URL without `wss://` or `https://` protocol, without the `/staging` and `/production` path part, and the suffix `@connections` (which was removed by AWS from the `ApiGatewayManagementApi`)
- Removed `ArcRoleReflection` policy from the generated IAM Role
- Removed `PYTHONPATH` unless a Lambda function explicitly has a Python runtime

---

## [6.0.20] 2019-11-5

### Added

- Integrates new `@architect/create` module for bootstrapping projects and initializing project files
- Added ability to specify project name and install path, e.g. `arc init ./foo` creates a dir named `foo` in your current dir, and creates a new Arc project named `foo` in there


### Changed

- Updated dependencies (which are also now using `@architect/create`)
- Updated CLI documentation to reflect current functionality of `arc env`


### Fixed

- Fixes issue when `@tables` definition includes `stream true`; thanks @gr2m!
- Fixes and `arc help <command>` command
- Runtime flag now works for project creation: `runtime`, `--runtime`, or `-r` + `node`, `js`, `python`, `py`, `ruby`, `rb` initializes with Node, Python, or Ruby
- Removed some unnecessary dependencies

---

## [6.0.19] 2019-10-17

### Fixed

- Fixes failed deploys if file type is unknown by common mime-type database; resolves #56, thanks @mikemaccana!
- Fixes paths for deployment of assets on Windows; resolves #58, thanks @mikemaccana!

---

## [6.0.18] 2019-10-15

### Added

- Infrequently prints version update notifications to CLI

---

## [6.0.15 - 6.0.17] 2019-10-15

### Added

- Added update notifier to help ensure folks are running the (hopefully) least buggy, most stable, most secure version of Architect


### Changed

- Updated dependencies


### Fixed

- Fixes deployment issue if `get /` is not specified in `@http`; resolves @package#27, /ht @grahamb and @jeffreyfate!


### Changed

- Improves error states for missing static configs, 404s, etc. when using `@http` and/or `@static` with `arc.http.proxy` or without defining `get /`

---

## [6.0.15] 2019-10-14

### Changed

- Legacy WebSockets paths on the filesystem are now formally deprecated
  - Your default three WebSockets paths should be: `src/ws/default`, `src/ws/connect`, `src/ws/disconnect`
  - If you're using legacy WebSockets paths (either `src/ws/ws-default` or `src/ws/ws-$default`), simply remove `ws-[$]` and you should be all set!


### Fixed

- Fixed issue when emitting to WebSockets with Arc Functions (`arc.ws.send`); resolves #48, thanks @andybee + @bvkimball!
- Fixed issue where `sandbox` may not have correctly resolved some custom WebSocket actions
- Fixed HTTP request with `body` and no `Content-Type` header; resolves #102, thanks @andybee!
- Fixed issue where killed subprocesses would not trigger timeouts; resolves #30, /ht @mikemaccana
- Fixed issue where functions with legacy runtimes may not have been fully hydrated

---

## [6.0.14] 2019-10-11

### Added

- Added support for `@static fingerprint true` in root spa / proxy requests
  - This enables Architect projects to deliver fully fingerprinted static assets while also ensuring that each file is appropriately cached by clients and network infra
  - Also includes support for build-free calls between your fingerprinted static assets
    - Example: in `public/index.html`, use the following syntax to automatically replace the local / human-friendly filename reference to the deployed fingerprinted filename:
    - `${arc.static('image.png')}` will be automatically replaced by `image-a1c3e5.png`
    - Or `${STATIC('image.png')}` (which is the same thing, but shoutier)
    - Note: although those look like JS template literal placeholders, they're intended to live inside non-executed, static files within `public/` (or `@static folder foo`)


### Changed

- Updated dependencies
- Ensures html / json are published to S3 with anti-cache headers


### Fixed

- Restores static asset pruning (`arc deploy --prune` or `arc deploy --static --prune`)
- Fixes issues with parsing certain properties in `arc.json`, thanks @mikemaccana!
- Fixed issue that may prevent `repl` from working in more recent versions
- Add anti-caching headers to `sandbox` 404 response
- Fixes root spa / proxy requests when Architect and/or Sandbox are globally installed; resolves #92 /ht @grahamb

---

## [6.0.13] 2019-10-02

### Fixed

- Fixed issue where with `@static fingerprint true` enabled, the `static.json` file would not be copied into deployed functions' shared dirs; thanks @dawnerd + @jgallen23!
- Removed unnecessary second-order dependency, which should lighten up the Architect install size a bit


### Changed

- Updated dependencies

---

## [6.0.11 - 6.0.12] 2019-09-29

### Added

- `sandbox` Auto-hydration received a bunch of nice upgrades:
  - Auto-hydration now detects changes to the state of your installed Node dependencies, and rehydrates if necessary; for example:
    - You're working on a project, and a teammate updates a dependency in `get /foo` from version `1.0.0` to `1.1.0`
    - Upon your next git pull, `sandbox` will detect the dependency update in `get /foo` and automatically install version `1.1.0` for you
  - Auto-hydration now has a rate limit of one change every 500ms to prevent recursive or aggressive file updates
  - Auto-hydration now has `@static folder` support
  - Auto-hydration now only hydrates the shared files necessary
    - For example: if you change a file in `src/views`, it will only update your `@views` functions, and not attempt to rehydrate all your project's functions with `src/shared`
  - Events now have a timestamp and improved formatting
- Beta: `sandbox` init script support!
  - `sandbox` will now run the init script of your choosing upon startup after all subsystems have started up:
    - `scripts/sandbox-startup.js` - a CommonJS module, receives your parsed Arc project as a parameter, supports async/await
    - `scripts/sandbox-startup.py` - a Python script
    - `scripts/sandbox-startup.rb` - a Ruby script
- Startup auto-hydration now hydrates `src/views` and `src/shared`
- Added support for `@static folder` to static asset `fingerprint`ing


### Changed

- Improvements to the conditions under which the HTTP server starts, shuts down, and restarts; fixes `sandbox` #65
- Improved `sandbox` async error copy (displayed when execution does not complete)
- Proxied requests in `sandbox` now sends a proper `req.resource`, which can resolve some SPA bugs, esp when used with newer Arc Functions
- `sandbox` now respects and errors on invalid response params for proper Architect 6 compatibility; fixes `sandbox` #49
- Updates `sandbox` to Dynalite to `3.0.0`, thanks @mhart!
- Better 404 / file missing handling in `sandbox` when using `http.proxy` (or loading assets without `@http get /` specified)
- `hydrate --update` now properly inventories its update operations, avoiding superfluous work


### Fixed

- Fixes correct inventory paths for `src/ws/*`, which should in turn fix WebSocket function hydration, thanks @mikemaccana!
- When auto-hydrating functions upon startup, `sandbox` no longer hydrates `src/views` and `src/shared` with each function
- Fixed issue where `hydrate`'s shared file copying may have leaked across Lambda executions in rare circumstances
- Fixed undefined message in `hydrate` init
- Improved `hydrate` error bubbling
- Formatting and line breaks in `hydrate` printer return should now more closely (or exactly) match console output
- Fixed issue where in certain circumstances `get /` wouldn't reload `sandbox` after a change to the project manifest
- Minor fix where if you specified a `SESSION_TABLE_NAME` env var outside of `.arc-env`, `sandbox` won't clobber it
- Fixed caching headers for various `sandbox` error states (async, timeout, etc.) to ensure your browser won't accidentally cache an error response
- Fixes issue where binary assets delivered via `sandbox` / root may not be properly encoded
- Fixes empty mock `context` object encoding

---

## [6.0.10] 2019-09-11

### Changed

- Running `hydrate` now properly inventories its update operations, avoiding superfluous work there as well
- Results returned by `hydrate` are now symmetrical with what's printed
- `@http` functions are now provisioned with the `ARC_HTTP` env var, which is set to `aws_proxy`


### Fixed

- Fixed `env` to ensure env vars were populated out of the correct region
- `sandbox.close` will no longer throw an error if project doesn't use `@http` or `@ws`
- Fixed reliability of `hydrate` and other Architect operations printing in CI containers and other non-TTY environments

---

## [6.0.9] 2019-09-09

### Changed

- Running `hydrate` now properly inventories its install operations, avoiding superfluous work


### Fixed

- Fixed issue where `sandbox` would hang if POST requests were sent without a body
- Fixed `logs` to ensure log data is read out of the correct region
- Fixed S3 permissions to enable direct asset uploading

---

## [6.0.8] 2019-09-06

### Fixed

- Fixes case where user-defined region may not be respected
- Fixes provisioning `@scheduled` functions

---

## [6.0.7] 2019-09-05

### Changed

- Add clearer bucket region instructions during init

---

## [6.0.6] 2019-08-30

### Changed

- Internal change; improve error handling states

---

## [6.0.5] 2019-08-28

### Added

- Added initialization confirmation messages


### Changed

- Improved boilerplate project files written during initialization
- Updated boilerplate .arc file initialized
- Patched vendored proxy bundle to 3.3.7
- Updated deps

---

## [6.0.4] 2019-08-27

### Changed

- Updated deps

---

## [6.0.3] 2019-08-24

### Fixed

- Internal error handling change


### Changed

- Updated deps

---

## [6.0.1 - 6.0.2] 2019-08-22

### Fixed

- Fixes issue with auto-hydration of new dependencies during `sandbox` startup
- Fixes issue with `arc deploy --static` throwing an unnecessary error after uploading files, fixes #427
- Fixes minor copy issue in `arc deploy` reporting the incorrect static asset folder when there are no files to deploy

---

## [6.0.0] 2019-08-20

### Changed

- Many things! Updates to this changelog forthcoming shortly. Arc 6.0 is a breaking change, please refer to https://arc.codes and upgrade mindfully!

---

## [5.9.24] 2019-08-05

### Fixed

- Resolves issue where static assets aren't loading from `_static/` in `sandbox`, fixes #416

---

## [5.9.23] 2019-07-23

### Fixed

- Fixed issue preventing Ruby functions from properly executing in `sandbox`
- Fixed issue prevent Python functions from properly executing in Windows `sandbox`
- Fix broken characters in Windows `sandbox` console
- Fixes super obscure bug where certain shared files may not be included in a single function deploy

### Changed

- `sandbox` context now passes an empty object (to be mocked soon!) to all runtimes
  - This deprecates the legacy AWS implementation of `context` (since retired in production) passed to `sandbox` Node functions

---

## [5.9.21-22] 2019-07-17

### Added

- Adds auto-hydration to new functions without restarting `sandbox`


### Fixed

- Fixes issue with auto-hydration on `sandbox` startup
- Fixes potential issue in static asset deploys in Windows

---

## [5.9.20] 2019-07-15

### Added

- Expanded support for static asset fingerprinting! If you've enabled fingerprinting (`@static fingerprint true`):
  - `sandbox` will regenerate your `public/static.json` file on startup
  - And whenever making any changes to your `public/` dir, `sandbox` auto-refresh will automatically regenerate `public/static.json` and re-hydrate your shared files with the latest version


### Fixed

- `sandbox` auto-refresh now detects file deletions from `src/shared` and `src/views`

---

## [5.9.19] 2019-07-12

### Added

- Adds PYTHONPATH to `sandbox` Lambda invocation for `/vendor` modules

### Fixed

- Fixes `sandbox` crashing when `get /` and other functions aren't defined in `.arc` or present in the filesystem, but are requested by a client
- Prevents startup of http server if `@http` isn't defined in `.arc`
- Improves `sandbox` support in Windows

---

## [5.9.18] 2019-07-12

### Fixed

- Fixes WebSocket provisioning issue

---

## [5.9.17] 2019-07-12

### Changed

- Disables delta resource creation during deployments
  - This functionality is better served by more reliable and deterministic resource creation via the forthcoming Architect 6 release

---

## [5.9.16] 2019-07-12

### Changed

- Reverts previous breaking change on WebSockets, default directories that get created are now once again `ws-connect`, `ws-default`, and `ws-disconnect`

---

## [5.9.15] 2019-06-26

### Added

- Auto-refresh! `sandbox` now keeps an eye out for the following changes to your project:
  - Edits to your Architect project manifest will mount or unmount HTTP routes without having to restart `sandbox`
  - Changes to `src/shared` and `src/views` will automatically rehydrate your functions' shared code
  - More to come!


### Changed

- Prettied up `sandbox` initialization printing a bit

---

## [5.9.14] 2019-06-25

### Added

- Auto-hydration!
  - Say goodbye to running `npx hydrate` before starting new projects, cloning existing projects, or pulling down new functions
  - On startup, any functions missing dependencies on the local filesystem will now be auto-hydrated
  - Supported runtimes and dependency manifests: Node + `package.json` (requires npm >= 5.7), Python + `requirements.txt` (calls pip3), and Ruby + Gemfile (calls bundle)

---

## [5.9.10-13] 2019-06-24

### Fixed

- Ensures `sandbox` starts in the cases of:
  - No local AWS credentials file (e.g `~/.aws/credentials`)
  - The local AWS credentials file is present, but is missing the requested profile name
  - Fixes #382, 391
- Fixed issue with `hydrate` caused by an errant merge

---

## [5.9.9] 2019-06-23

### Changed

- Projects that use WebSockets (`@ws`) in their `.arc` file will need to be cautious about upgrading
  - The default directories that get created are now `ws-$connect`, `ws-$default`, and `ws-$disconnect`; it is recommended that you run `npx create` and copy your code from `ws-connect` to `ws-$connect`, `ws-default` to `ws-$default`, and `ws-disconnect` to `ws-$disconnect` and then delete the old directories

### Fixes

- `@ws` directive now works correctly with the `npx inventory` command set
- Fixes `sandbox` wrapper when use as async module, adds `sandbox` test

---

## [5.9.8] - 2019-06-19

### Changed

- Deployments of static assets now follow symlinks in the `public/` directory

---

## [5.9.5-7] - 2019-06-18

### Changed

- The `sandbox` workflow is now its own module!
  - No functionality changes to `sandbox` in this release
  - A few minor improvements to `sandbox` console messages during startup, and drying up port assignment logic
  - You can find the `sandbox` module at https://github.com/architect/sandbox


### Fixed

- Some Arc-supported runtimes defined in `.arc-config` files (such as `nodejs8.10`) will no longer cause `sandbox` to crash

---

## [5.9.4] - 2019-06-15

### Added

- Added ability to disable Architect managing a given function's environment variables
  - Add an `@arc` pragma to your function's `.arc-config` file, and pass it the `env false` flag


---

## [5.9.3] - 2019-05-29

### Fixed

- Corrects URI encoding when accessing local static assets in _static, fixes #390
- Warns users of static deployments of files approaching the payload limit of Lambda, fixes #387
- Fixes static deploy errors of unknown file types


---

## [5.9.0 - 5.9.2] - 2019-05-23

### Added

- CloudFormation support! 🚀
  - `npx package` will export the current `.arc` file to `sam.json` and print further instructions for deploying
  - Currently only `@http`, `@static` and `@tables` pragmas are supported; you can track the other pragmas dev (or submit a PR!) here at #386
  - Any env vars in `.arc-env` are automatically applied to the CloudFormation stack
  - `.arc-config` settings are also fully supported
  - Unfortunately CF currently has a bug with binary media types which we're tracking here https://github.com/awslabs/serverless-application-model/issues/561
- Static asset fingerprinting beta!
  - Add `fingerprinting true` to your `@static` pragma to enable fingerprinting
  - Add `ignore` followed by a two-space indented list to ignore certain files from `public/`
  - [More information here](https://arc.codes/reference/static)
- Added new flag for pruning old static assets: `npx deploy [--static] --prune`
- Added ability to completely disable shared folder copying into functions
  - Add an `@arc` pragma to your function's `.arc-config` file, and pass it the `shared false` flag
- Ruby and Python local runtime support
  - `.arc-config` with `runtime` of either `ruby2.5` or `python3.7` works on localhost (make sure you have python and ruby installed!)


### Fixed

- Hydration (and other things that depend on hydrator operations) should now work more reliably on non-UNIXy machines


---

## [5.8.7] - 2019-05-21

### Fixed

- Fixes lack of `console.[warn|error|trace]` output in sandbox console


## [5.8.5 - 5.8.6] - 2019-05-15

### Changed

- Default Lambda runtime is now Node 10.x (from Node 8.10)
- Added simple rate limits to `npx config` and `npx config --apply`
- Updated dependencies


---

## [5.8.0 - 5.8.4] - 2019-05-08

### Added

- Adds `npx inventory nuke -f` for deleting DynamoDB tables and S3 buckets (even if they have contents)
  - Also adds aliases: `npx inventory -nf`, `npx inventory -fn`
- Scheduled function state enabled / disabled flag in `.arc-config` with `npx config`
- Concurrency `0-1` flag in `.arc-config` with `npx config` (applies to all function types)
- Support for custom routes in WebSocket API Gateways
  - `@ws` now accepts routes defined in `.arc`
  - To use these custom routes, the client message must contain an `action` key that is the name of the route


### Fixed

- DynamoDB tables and indexes now enqueue during create; fixes #268
- Sync queue visibility to function timeout; fixes #204
- Verifies queue resources deleted with `npx inventory nuke`; fixes #132
- Enhanced cron() and rate() validatation; fixes #148
- Now `npx inventory nuke` destroys Lambdas and CloudWatch Events rules
- Enhanced error reporting for bad creds or bad arcfiles (closes #339, #364)


### Changed
- New GitHub name! Find us at: [github.com/architect](https://github.com/architect)
  - If you're already developing for Architect projects, don't forget to update your git remotes, e.g.: `git remote set-url origin https://github.com/architect/architect.git && git remote -v`
  - Special thanks to @pug132 for the name (and a big hat-tip to @mikemaccana)!
- scheduled functions always putRule on `npx create` (fixes #326)


---

## [5.7.0] - 2019-04-17

### Added

- Support for AWS layers! /ht @julianduque
  - You may now specify `layer $layerARN` in the `@aws` section of your project manifest, or `.arc-config` files (see: [config](https://arc.codes/reference/arc-config)!
- Support for additional runtimes: `python3.7` and `ruby2.5`!
  - The list also includes: `nodejs8.10`, `python3.6`, `go1.x`, `dotnetcore2.1`, and `java8`
  - Specify `runtime $yourRuntime` in the `@aws` section of your project manifest, or `.arc-config` files
  - Of course, you can also add the runtime of your choosing by way of layer support
- Support for `application/binary-octet` & `multipart/form-data` requests, fixes #353
  - Requests with those two `Content-Type` headers will produce a `base64` object in the `body` object, like so: `body: {base64: 'R28gR2lhbnRzIQ=='}`
  - Empty request bodies will still produce an empty object (e.g. `body: {}`)


### Fixed

- `config [--apply]` now has an easier to read layout, improved diffing, and instructions on how to apply changes
- Added resource creation error handling and validation to `deploy`
- Invalid runtime settings emit a friendly warning about defaulting to `node8.10`


### Changed

- `get /` no longer required by `@http`
- Updated dependencies (most notably `@architect/parser` to support `runtime` and `layers` settings)
- Resource creation error handling moved into common utils (internal)


---


## [5.6.3] - 2019-04-08

### Fixed

- Fixes WebSocket support in `sandbox`; fixes #328 /ht @rschweizer


### Changed

- Cleans up http invocation for doc content-types in `sandbox`
- Slightly better rate limit error message


---


## [5.6.1] - 2019-04-06

### Added

- Adds `req.httpMethod` and `req.queryStringParameters`


### Removed

- Removes deprecated code paths


---


## [5.6.0 - 5.6.1] - 2019-04-04

### Added

- Enables both text and binary file transit in newly provisioned Arc apps
- Adds the same capability to `sandbox`
- This is NOT a breaking update, however if you'd like your existing app to serve binary assets, you'll need to re-create your API (or hang tight until we release our forthcoming API migration tool)
- Adds `req.httpMethod` and `req.queryStringParameters`
- Removes deprecated code paths

---


## [5.5.10] - 2019-03-15

### Added

- Cache-control header support to `sandbox`
  - Default for local dev environment is not to send any `cache-control` header
  - If specified, `cache-control` passes through


---

## [5.5.9] - 2019-03-13

### Added

- Cache-control header support; if not specified, defaults to:
  - HTML + JSON: `no-cache, no-store, must-revalidate, max-age=0, s-maxage=0`
  - Everything else: `max-age=86400`
  - This change only applies to Architect apps provisioned from this version forward

### Fixed

- Default `content-type` response of `application/json` is now `application/json; charset=utf-8;`

### Changed

- Updated dependencies

---

## [5.5.6 - 5.5.8] - 2019-02-28

### Fixed

- Now properly deletes the entire CloudWatch log group when nuking; fixes #311 /ht @mikeal
- Fixes `sandbox` to work properly when `content-type` has charset assignment; #303, #305 /ht @hada-unlimited
- Fixes issue with `audit` breaking on `@ws` functions; #311 /ht @mikeal
- `sandbox` now accepts `statusCode`, in addition to `status` and `code`; fixes #323


---

## [5.5.5] - 2019-02-22

### Fixed

- Fixes ordering logs by last event /ht @mikeal


---

## [5.5.2 - 5.5.4] - 2019-02-20

### Fixed

- `logs` forces descending order
- Query params no longer trigger index.html override for `sandbox`
- Adds support for `text/tsx` in `/public`


---

## [5.5.1] - 2019-02-08

### Changed

- Updated dependencies

### Removed

- `test:watch` script and `tape-watch` devdep (due to multiple dependencies with CVEs)


---

## [5.5.0] - 2019-02-03

SPA support: mount S3 on the `/` of API Gateway

### Added

- `ANY /{proxy+}` will now route any 'not found' to the HTTP Lambda `src/http/get-index`
  - Note: proxy+ routes have a slightly different request payload that includes `request.requestContext` not available to regular HTTP Lambdas (so you can use this to test a 404 condition)
- `ANY /_static/{proxy+}` will proxy to S3 buckets defined by `@static` (if you want to skip proxying through Lambda)
- Companion library `@architect/functions` also gained `arc.proxy.public` superpower for proxying all requests NOT defined by `.arc` to the `@static` S3 buckets

[For more about single page apps with Architect see there docs here.](https://arc.codes/guides/spa)


### Changed

- If `@http` is defined, then `get /` must also be defined
- `npx sandbox` now mounts `/public` on `http://localhost:3333/_static` to match the deployed API Gateway S3 proxy


---

## [5.0.6] - 2019-01-25

### Added

- Improvements to build plugins system (did you know Architect has a build plugins system?)
  - Now supports NPM scoping (e.g. `@architect/arc-plugin-node-prune`)
  - Build preparation order now runs pre-deploy build plugins last (after dependency hydration)
  - Published a companion beta / demo plugin: [`@architect/arc-plugin-node-prune`](https://www.npmjs.com/package/@architect/arc-plugin-node-prune), clean the cruft out of your `node_modules`!


### Fixed

- Fixes `create` breaking if `@ws` is not present in `.arc`, #276


---

## [5.0.4] - 2019-01-24

### Added

- `repl` now respects environments, allowing you to connect to your remote databases with the `NODE_ENV` environment variable


### Fixed

- `repl` was being clobbered by `@architect/data`'s own implementation; fixed in `architect/arc-data` #12, dependency updated


### Changed

- Updated dependencies


---

## [5.0.2] - 2019-01-22

### Added

- Support for `@ws` in `.arc` for generating WebSocket Lambdas and API Gateway endpoints
- Support for WebSocket Lambdas in the local sandbox
- WebSocket Lambdas support in `inventory`, which in turn powers most other workflows


### Removed

- Support for `@slack` as the more generic `@http` Lambdas support that use case better


### Fixed

- Fixes `@indexes` creation bug
- Runs `npm i` during `hydrate --update`, resolving a long-standing NPM issue where package-lock files may fall out of sync
- Fixed: on Windows, S3 assets will be correctly created relative to their location beneath `public` rather than their full paths.

### Changed

- Updated dependencies


---

## [4.5.6] - 2019-01-14


### Fixed

- Fixes callback in _create-code task, fixes #263


### Changed

- Improved error handling in NPM operations


---

## [4.5.5] - 2019-01-11


### Fixed

- In Windows, NPM no longer fails with `undefined`, fixes #261


---

## [4.5.4] - 2019-01-10


### Changed

- Improved status reporting during `deploy` and `create`


### Fixed

- Fixes cases where hydration was crashing single function deployments, and deployments that execute `create` for missing resources


---

## [4.5.1] - 2019-01-08


### Changed

- `hydrate` refactor and API
  - NPM operations are now queued and concurrently processed (env var `ARC_MAX_NPM`, defaults to 10) /ht @grncdr
  - Vastly improved NPM error handling and related deployment reliability (fixes #141 + #151)
  - Now hydrates (and updates) deterministically from the current .arc manifest, as opposed to globbing
  - All NPM operations now use `npm ci` for more consistent behavior across environments
  - Updates `deploy` to use `hydrate` API, and `sandbox` to use new shared code copier module
- DynamoDB tables now use on-demand/pay-per-request billing mode, mitigating the need for capacity planning /ht @alexdilley
- `inventory` now supplies its own Arc project data, allowing it to be called as needed without relying on `util/init`


### Fixed

- Freshly created Functions are now properly hydrated with shared code (if available and appropriate; fixes #241)
- Running `create` on already existing projects now runs orders of magnitute faster
- `.arc` file is now reliably copied into each Function's `node_modules/@architect/shared` even if you don't use `src/shared` (needed by `@architect` deps)
- `deploy` now respects `--delete` flag when deploying the whole project
- Improved progress reporting in `CI` mode, and for `hydrate`, `create`, and `deploy`


### Added

- New command: `hydrate --shared [--update]` - hydrates and/or updates `src/shared` and `src/views` (if available)
- Added test run watcher script /ht @filmaj


---

## [4.4.12] - 2018-12-23


### Removed

The following folders are no longer required nor autogenerated:

- `src/shared`
- `src/views`
- `/public`

Functionality remains unchanged: Contents of `src/shared` are synced to `node_modules/@architect/shared` in all lambdas whenever deploying or using the sandbox. Contents of `src/views` are synced to all HTTP GET lambdas `node_modules/@architect/views`. Public is synced to S3 buckets.


---

## [4.4.11] - 2018-12-19


### Added

- Updates `sandbox`, adding minor performance tweaks now, and setting up for future enhancements
  - Updated `sandbox` to asynchronously read files when invoking a Lambdas
  - Updates runtime handling in `sandbox` to make it easier to add additional runtimes
  - Each runtime now lives in its own function, which also enables process forking later on


---

## [4.4.10] - 2018-12-18


### Added

- New logo (added to readme)! /ht @amberdawn
- `hydrate` and `deploy` now install dependencies in `src/shared` and `src/views` (#240)
- `QUIET` boolean env var suppresses init header (fixes #238)
  - Helpful for piping data to disk, e.g. setting up new users on an Architect project with `QUIET=1 npx env > .arc-env`
- `app.arc` app filename supported as a non-dotfile alternative to `.arc` (#239)


### Changed

- Static asset deploys now exclude default `public/readme.md` file
- Improved `hydrate` progress and completion confirmation
- Adds Architect version back into the init header


### Fixed

- `hydrate` was not properly globbing (and thus, not hydrating) `src/shared` contents


---

## [4.4.9] - 2018-12-16 (merge commit, no changes)


---

## [4.4.8] - 2018-12-12


### Added

- To help accommodate `sandbox` calling out to remote databases, `SANDBOX_TIMEOUT` env var allows you specify in seconds how long `sandbox` should wait for all child processes to complete
  - `SANDBOX_TIMEOUT` is overridden by any directory-specific `.arc-config` files


### Changed

- Default `sandbox` timeout is now symmetrical with Architect's default Lambda timeout time of 5 seconds


---

## [4.4.7] - 2018-12-11


### Added

- Form-encoded POST values can now be sent enclosed in single quotes /ht @herschel666


### Changed

- Skip logging when `@static` isn't deployed
- Additional hardening of `sandbox` handling of JSON responses emitted from `@architect/functions`
- Preliminary / prototype commits for outputting CloudFormation from .arc
- Preliminary / prototype commits in the direction of adding arbitrary header support /ht @mweagle


### Fixed

- Issue where `arc.http` JSON responses were crashing `sandbox` due to an encoding mismatch
- Issue where `ARC_LOCAL` env var wasn't being properly respected by `sandbox` events


---

## [4.4.5] - 2018-12-7


### Added

- Local `@queues` now available in `sandbox`
- Big ups to @grncdr for this feature!


### Fixed

- `hydrate` wasn't updated to use the new progress indicator, and would fail when used – no longer!


---

## [4.4.4] - 2018-12-1


### Added

- `deploy` operations now read local and remote last-modified times, and will skip files whose times don't differ, thereby speeding up deploy operations of static files
- Big ups to @filmaj for this release, too!


---

## [4.4.3] - 2018-11-30


### Added

- `npx deploy static`: deploys only `@static` assets (as found in the `public/` folder)
  - Accepts `staging | --staging | -s` and `production | --production | -p` flags
- `npx deploy static --delete`: deploys static assets, and deletes remote S3 files not present locally in `public/`
  - Can be used with `staging` and `production` flags
- Big ups to @filmaj for this release!


---

## [4.4.0] - 2018-11-27


### Added

- Large refactor of `deploy` workflow to improve stability and reliability
- `deploy` now identifies missing project resources during deploy operations
  - Instead of failing / throwing errors, `deploy` now completes its first pass deployment
  - Then, once completed, `deploy` creates any resources missing from the deployment (and deploys them)


### Changed

- `npx inventory --nuke` now destroys `@static` resources (S3 buckets) and `@events` resources (SNS Topics).
- New projects will no longer create `arc-sessions` tables (for use with `@architect/functions`) by default, and are now explicitly opt-in
- Replaces `progress` module with a lighter weight, more readily cross-platform homegrown solution


---

## [4.3.14] - 2018-11-26


### Changed

- `logs` command results now sorted chronologically


### Fixed

- Fixes console leaking of large responses in `sandbox`


---

## [4.3.13] - 2018-11-24


### Fixed

- `sandbox` was broken in the JWE changeover
- Fixes some broken tests


### Removed

- Unnecessary session table test stubs


---

## [4.3.12] - 2018-11-23


### Changed

- New default for Architect sessions is based on JWE
- DynamoDB sessions are still available, but [now opt-in](https://arc.codes/guides/sessions)
- `sandbox` now matches the 6MB request payload limit of Lambda /ht @herschel666


---

## [4.3.10] - 2018-11-19


### Added

- dotfiles are now included in Lambda deployments


---

## [4.3.9] - 2018-11-15


### Changed

- Architect parser now accepts multiple spaces between http verb and path in `@http` functions


### Fixed

- `sandbox` now properly pretty prints paths


---

## [4.3.8] - 2018-11-14


### Added

- Additional S3 deploy tests


---

## [4.3.7] - 2018-11-13


### Changed

- `sandbox` clears async function timeout if execution is faster than specified timeout


---

## [4.3.6] - 2018-11-12


### Added

- Better async error handling (and more helpful error text) in sandbox
- Trap and present friendly error when async functions don't return a value in sandbox
- `sandbox` returns a promise if no callback is specified
- Adds repl


---

## [4.3.1] - 2018-11-12


### Fixed

- Error with `/public` folder in sandbox


---

## [4.3.0] - 2018-11-12


### Added

- `arc.sandbox.start` now accepts a regular node errback as the last arg


---

## [4.2.2] - 2018-11-12


### Added

- This changelog!


### Fixed

- Removed generated test coverage files from NPM package bundle
- Inline help typos


---

## [4.2.1] - 2018-11-09


### Added

- `CI` env boolean for disabling `deploy` progress indicator in CI


---

## [4.2.0] - 2018-08-12


## Added

- CORS support for `sandbox`


## Fixed

- CORS bug in HTTP functions
- Issue with `sandbox` not properly passing callbacks if used as a module


---

## [4.1.3] - 2018-11-6


### Added

- Massive tests refactor, shout out to @filmaj!
  - Added tests for many important workflows
  - Code coverage now tracked with Istanbul
- Architect's CI is now public via TravisCI


---

## [4.1.2] - 2018-10-31


### Changed

- Roughed in resource flagging (not yet ready, though)


### Fixed

- Restored accidentally removed `readme.md`


---

## [4.1.1] - 2018-10-31


### Added

- `logs` workflow!
- Command line flags for various workflows:
  - `audit`: `apply`, `--apply`, `-a`
  - `config`: `apply`, `--apply`, `-a`
  - `create`: `local`, `--local`, `-l`
  - `deploy`: `production`, `--production`, `staging`, `--staging`, `public`, `--public`, `/public`, `lambda`, `--lambda`, `lambdas`, `--lambdas`, `functions`, `--functions`
  - `dns`: `nuke`, `--nuke`, `-n`, `route53`, `--route53`, `-r`
  - `env`: `verify`, `--verify`, `-v`, `remove`, `--remove`, `-r`
  - `hydrate`: `update`, `--update`, `-u`
  - `inventory`: `nuke`, `--nuke`, `-n`, `--nuke=tables`, `verify`, `--verify`, `-v`
  - `sandbox`: `production`, `--production`, `-p`, `staging`, `--staging`, `-s`, `testing`, `--testing`, `-t`
- Additional path validation for leading and trailing special characters


### Changed

- Refactored `deploy` command to support additional command line flags, and surgical deploys of just `/public`, or just Lambdas
- Copy fixes for deployment workflow
- Made boilerplate HTTP functions a bit more minimal
- Improved `sandbox` testing


---

## [4.1] - 2018-10-24


### Added

- Automagical `src/views` folder: copies contents into all `HTTP GET` functions' `node_modules/@architect/views`
- `@views` pragma, overrides bulk `src/views` copy, and only copies into specified functions
- More information on `src/views` and `@views` [can be found here](https://blog.begin.com/serverless-front-end-patterns-with-architect-views-cf4748aa1ec7)
- Adds ability to use the following special characters in static URL parts: `-` (dash), `.` (period), `_` underscore
- New HTTP function validation logic:
  - HTTP functions must begin and end with a letter or number
  - Cannot create URL params that contain special chars (except leading `:`, of course)
- Adds command-line flags:
  - `npx create`:
    - `local`, `--local`, `-l`
  - `npx deploy`:
    - `production`, `--production`, `-p`
    - `staging`, `--staging`, `-s`
- New [Examples repo](https://github.com/architect/examples)


### Changed
- Some light boilerplate code cleanup
- [#168](https://github.com/architect/architect/issues/168) Fixed issue where Architect parser was missing `@http` support in JSON + YAML manifests
- [#164](https://github.com/architect/architect/issues/164) Fixed issue in Windows where Architect would try to copy files over itself


---

## [4.0] - 2018-10-20


### Added

- `@http` pragma, now the default way to create Lambda functions for the web
  - Supports fully dynamic Content-Type, Status Code
  - Supports all HTTP methods
  - CORS support with a boolean flag
- `public` folder, now the default way to sync static assets to S3
- `JSON` & `YAML` support for the `.arc` manifest
- Per-Lambda function configuration support with `.arc-config` files
- Per-Lambda function IAM roles support with `role.json` files


### Changed

- Simpler package name (`npm i @architect/architect`)
- New GitHub name ([https://github.com/architect/architect](https://github.com/architect/architect))
- Smarter rate-limiting for deployments of large (50+ function) projects
- Complete docs revamp with new sample projects at [arc.codes](https://arc.codes)
- Fix for obscure bug where `server.close`causes a TypeError
- Readme file cleanup


### Removed

- `.static` folder has been deprecated in favor of the new `public` folder
- Statically bound Content-Type web functions (i.e. `@html`, `@css`) are deprecated
  - `sandbox` will no longer bootstrap these kinds of functions
  - `create` will no longer make these kinds of functions
  - However, `deploy` still supports deploying these legacy functions


---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
