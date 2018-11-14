# npx config

Configure individually deployed Lambda functions with a local manifest file: `.arc-config`.  This file lives in the same folder as each lambda it configures.

## Configuration Management

`.arc-config` files are:

- checked in to the lambda source code itself
- only options are memory and timeout (for now)
- scoped under `@aws` so future configs can be, in theory, cloud agnostic (and YOU KNOW they'll config diff ;)

```arc
# src/html/get-index/.arc-config
@aws
memory 512
timeout 5
```

## Example Usage

-  `npx config` verifies the current configuration and displays a report of all `.arc-config` statuses to deployed lambdas
-  `npx config [apply | '--apply' | '-a']` applies the current configuration to the corresponding staging and production lambdas (careful!)
