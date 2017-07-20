# <kbd>:cloud_with_lightning: `@architect/env`</kbd>

Introduces two new manifest files and one new workflow:

- `.arc-config`
- `.arc-env`


# `arc-confg`

- these are checked in to the lambda itself
- only options are memory and timeout (for now)
- scoped under @aws so future configs can be, in theory, cloud agnostic (and YOU KNOW they'll config diff ;)

```arc
@aws
memory 512
timeout 5
```

# `.arc-env`

Goal: everything in one file! env var config is painful. The common `.env` file approach doesnt let you speficiy mulitple sets of env vars. it would be nice to have the ability to set env vars globally and per lambda basis. It would also be nice to be able to see env vars for testing, staging and production at the same time all in one place.

- never checked in!
- lives in the root
- automatically read by `arc-sandbox` and populates `process.env` when `npm start` runs offline
- CANNOT overwrite `NODE_ENV`, `ARC_APP_NAME` or `SESSION_TABLE_NAME`
- devs have to figure out how to store/share it themselves (keybase.io maybe?)

```arc
# example .arc-env

# global values go under @staging and @production (maybe thats enough?)
@testing 
GLOBAL asdfasdf

@staging
GLOBAL_KEY val

@production
GLOBAL_KEY val3

# per lambda values could go like this
@html-staging
get-index
  LAMBDA_ENV_VAR asdfasdf
  ANOTHER_VAR asdfasdf

@html-production
get-index
  LAMBDA_ENV_VAR asdfasdf
  ANOTHER_VAR asdfasdfds

@json
get-api
  SLACK_CLIENT_ID asdfasdf
```


Start w global only and have a plan to do per lambda env vars in the roadmap.

# Workflows

`npm run env` will apply the `.arc-env` and any `.arc-config` found to all staging and production lambdas in parallel 

(careful!)

