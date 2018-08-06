# <kbd>:cloud_with_lightning: `arc-env`</kbd>

## Environment Variables

Managing sensitive configuration data like API keys needs to happen _outside_ of the codebase in revision control. 

- `npx env` displays environment variables for the current `.arc`
- `npx env testing` displays environment variables for testing (protip: `npx arc-env testing > .arc-env`)
- `npx env testing FOOBAZ somevalue` writes env variable `FOOBAZ=somevalue` for testing env
- `npx env remove testing FOOBAZ` 
- `npx env verify` display a report of lambdas and their env variables

Things to note:
- Adding and removing variables automatically syncs all lambdas and, if present in the current working directory, `.arc-env`.
- CANNOT overwrite `NODE_ENV`, `ARC_APP_NAME` or `SESSION_TABLE_NAME`

> Currently `.arc` uses AWS Systems Manager Parameter Store as a centralized backing storage mechanism for app environment variables because it is free. 

# `.arc-env`

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
