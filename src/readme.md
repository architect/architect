# Overview of Code

Each arc command is invocable from the CLI, importable through node.js'
module system and is housed in its own subdirectory within this folder.

## CLI Invocation

Check out the [`package.json`'s `bin`
section](https://github.com/architect/architect/blob/master/package.json#L6) to see how the CLI commands map to source code. Generally speaking, every command contains an executable `cli.js` that handles argument and environment parsing and then calls into supporting modules housing the majority of logic.

## Command Documentation

Each command is documented in the [top-level `doc`/folder](https://github.com/architect/architect/blob/master/doc).
