# Hydrate command + API

## `npx hydrate` || `hydrate.install()`

Manages installation of modules in all Functions (including calling to `hydrate.shared()`).

To ensure local development behavior is as close to `staging` and `production` as possible, `hydrate.install()` (and other hydrate functions) now only use `npm ci`, and not `npm i`.


## `npx hydrate --update` || `hydrate.update()`

Update is functionally almost identical to install; due certain inconsistencies around `npm update`, and the near-future need to support the concerns of multiple runtimes and package managers


## `npx hydrate --shared` || `hydrate.shared()`

Installs or updates shared code (in `src/shared` and `src/views`), and its various dependencies. Also includes `shared/_copy`, a module that generically copies shared code and dependencies to any and all appropriate destination Functions.


## `npm` operations

NPM operations are queued and processed concurrently; to respect the `ARC_MAX_NPM`, do not parallelize NPM operations. Instead, send your array of commands, and wait until all are completed before initiating further NPM operations. 
