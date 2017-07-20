# <kbd>:cloud_with_lightning: @architect/modules</kbd>

> Manage shared dependencies for all `.arc` defined cloud functions in `./src`

One characteristic of AWS Lambda is dependencies must be manually managed before deployment. Often you can just change into the directories and run `npm` commands as needed but this can get tedious across many Lambdas. This module provides `npm run` scripts to proxy a few of the most common `npm` commands:

- `install`
- `link`
- `uninstall`
- `update`

## setup

```javascript
{
  "install": "arc-modules-install",
  "link": "arc-modules-link",
  "uninstall": "arc-modules-uninstall",
  "update": "arc-modules-update",
}
```

### arc-modules-install

Installs package from npm to all `.arc` defined cloud functions in `./src`. Always runs `--save --production`.

Example usage:

```
npm run install lodash
```

### arc-modules-link

Links locally defined package to all `.arc` defined cloud functions in `./src`.

Example usage:

```
npm run link src/my-shared-module
```

### arc-modules-uninstall

Uninstalls package from all `.arc` defined cloud functions in `./src`.

Example usage:

```
npm run uninstall lodash
```

### arc-modules-update

Updates package in all `.arc` defined cloud functions in `./src`. Always runs `--save --production`.

Example usage:

```
npm run update lodash
```
