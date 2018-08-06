# <kbd>:cloud_with_lightning: `arc-config`</kbd>

Introduces two new manifest files and one new workflow:

- `.arc-config` is a configuration manifest file that lives in the same folder as each lambda it configures
- `npx config` display a report of all `.arc-config` status to deployed lambdas
- `npx config apply` applies `.arc-config` to the corresponding staging and production lambdas (careful!)

## Configuration Management

`.arc-confg` overview

- these are checked in to the lambda source code itself
- only options are memory and timeout (for now)
- scoped under `@aws` so future configs can be, in theory, cloud agnostic (and YOU KNOW they'll config diff ;)

```arc
# src/html/get-index/.arc-config
@aws
memory 512
timeout 5
```
