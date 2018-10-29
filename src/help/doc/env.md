# npx env

Manage environment variables for all lambdas defined by `.arc`.

# Examples

- `npx env` read env vars
- `npx env [verify | '--verify' | '-v']` verify env vars are syncd to all lambdas
- `npx env testing FOO bar` add an env var to testing env
- `npx env [remove | '--remove' | '-r'] testing FOO` remove an env var from testing env
