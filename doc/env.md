# npx env

Manage environment variables for all lambdas defined by `.arc`. Currently this system uses AWS Systems Manager Parameter Store as a centralized backing storage mechanism for app environment variables because it is 🆓. 

Managing sensitive configuration data like API keys needs to happen _outside_ of the codebase in revision control. 

Adding and removing variables automatically syncs all lambdas and, if present in the current working directory, `.arc-env` (more on this file below).


## `.arc-env`

- Automatically read by `arc-sandbox` and populates `process.env` when `npm start` runs locally
- Lives in the root but *never* checked in!
- Lists env vars for `testing` or `staging` for local dev

```arc
# example .arc-env
@testing 
GLOBAL asdfasdf

@staging
GLOBAL_KEY val
```

## Significant Env Vars

Env variables used to opt into functionality by `@architect/functions` (or your code) at runtime:

- `NODE_ENV` used to determine if the Lambda environment is `testing`, `staging` or `production`
- `ARC_APP_NAME` defined by `.arc` when the Lambda was created; used for publishing to SNS and SQS
- `SESSION_TABLE_NAME` used to store session (if the value is `jwe` stateless sessions are used)
- `ARC_APP_SECRET` used to sign/encrypt sessions

You CANNOT overwrite `NODE_ENV` or `ARC_APP_NAME`. You CAN overwrite `SESSION_TABLE_NAME` and `ARC_APP_SECRET`.

## Example Usage

- `npx env` displays environment variables for the current `.arc`
- `npx env [verify | '--verify' | '-v']` verify env vars are syncd to all lambdas and display a report
- `npx env testing` displays environment variables for testing (protip: `npx arc-env testing > .arc-env`)
- `npx env testing FOO bar` writes an env variable `FOO=bar` to the testing env
- `npx env [remove | '--remove' | '-r'] testing FOO` remove the env variable `FOO` from the testing env
