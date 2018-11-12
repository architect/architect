# Architect changelog


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
- Improved sandbox testing


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
- New [Examples repo](https://github.com/arc-repos/examples)


### Changed
- Some light boilerplate code cleanup
- [#168](https://github.com/arc-repos/architect/issues/168) Fixed issue where Architect parser was missing `@http` support in JSON + YAML manifests
- [#164](https://github.com/arc-repos/architect/issues/164) Fixed issue in Windows where Architect would try to copy files over itself


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
- New GitHub name ([https://github.com/arc-repos/architect](https://github.com/arc-repos/architect))
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
