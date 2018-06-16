# <kbd>:cloud_with_lightning: @architect/workflows</kbd> [ ![Codeship Status for arc-repos/arc-workflows](https://app.codeship.com/projects/171c66d0-4fa3-0135-c228-1654ec891f79/status?branch=master)](https://app.codeship.com/projects/234104)

> Workflows for creating, deploying, working offline and more with AWS Lambda

## Install

  npm i @architect/workflows

This makes the following `npx` commands available:

- `config` looks for `.arc-config` files in all lambdas and ensures corosponding AWS Lambda deployment targets config is in sync; currently only `timeout` and `memory` supported
- `create` reads the `.arc` file in the current working directory and generates corosponding local code and AWS infra (if it does not already exist)
- `deploy` deploys lambdas in `src` and syncs s3 buckets
- `dns` sets up custom domains with API Gateway
- `env` read and write environment variables to all lambdas defined by `.arc`
- `help` get some help
- `hydrate` runs `npm i` in all lambdas; `hydrate update` runs `npm update` in all lambdas 
- `inventory` read/verify infra defined by `.arc`; `inventory nuke` deletes all infra except dynamodb tables; `ARC_NUKE=tables inventory nuke` deletes tables
- `sandbox` runs `.arc` locally with an in-memory database; `ARC_LOCAL=yas NODE_ENV=staging sandbox` runs locally but uses dynamodb `staging` tables

To see more examples try running:

  npx help

### Learn more

Full docs found at https://arc.codes
