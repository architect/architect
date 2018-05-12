# <kbd>:cloud_with_lightning: `arc-env`</kbd>

## Environment Variables

Managing sensitive configuration data like API keys needs to happen _outside_ of the codebase in revision control. 

- `npm run env` displays environment variables for the current `.arc`
- `npm run env testing` displays environment variables for testing (protip: `npm run env testing > .arc-env`)
- `npm run env --put testing --key FOOBAZ --value somevalue` writes env variable to `testing`
- `npm run env --delete testing --key FOOBAZ` 
- `npm run env verify` display a report of lambdas and their env variables

Adding and removing variables automatically syncs all lambdas and, if present in the current working directory, `.arc-env`.

> Currently `.arc` uses AWS Systems Manager Parameter Store as a centralized backing storage mechanism for app environment variables because it is free. 

# `.arc-env`

Goal: everything in one file! env var config is painful. The common `.env` file approach doesnt let you speficiy mulitple sets of env vars. It would also be nice to be able to see env vars for testing, staging and production at the same time all in one place.

- never checked in!
- lives in the root
- automatically read by `arc-sandbox` and populates `process.env` when `npm start` runs offline
- CANNOT overwrite `NODE_ENV`, `ARC_APP_NAME` or `SESSION_TABLE_NAME`
- devs have to figure out how to store/share it themselves (keybase.io maybe?)

```arc
# example .arc-env
@testing 
GLOBAL asdfasdf

@staging
GLOBAL_KEY val

@production
GLOBAL_KEY val3
```

