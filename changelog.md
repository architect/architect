 # Architect changelog

---
Also see:
- [Architect Functions changelog](https://github.com/architect/arc-functions/blob/master/changelog.md)
- [Architect Data changelog](https://github.com/architect/arc-data/blob/master/changelog.md)
---

### Changed

- Projects that use the `@ws` directive in their `.arc` file will need to be cautious about upgrading
  - The default directories that get created are now `ws-$connect`, `ws-$default`, and `ws-$disconnect`; it is recommended that you run `npx create` and copy your code from `ws-connect` to `ws-$connect`, `ws-default` to `ws-$default`, and `ws-disconnect` to `ws-$disconnect` and then delete the old directories

### Fixes

- `@ws` directive now works correctly with the `npx inventory` command set


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


### Fixes

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
