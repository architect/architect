# Architect changelog


---


## [4.1] - 2018-10-29


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

## [4.0] - 2018-10-22


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
