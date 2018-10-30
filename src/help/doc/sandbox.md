# npx sandbox

Run `.arc` locally.

# Examples

- `npx sandbox`
run `sandbox` locally and in-memory, connecting to sandbox DB

- `npx sandbox [staging | --staging | production | --production]`
set the environment to `staging` or `production`, and connect to your remote `staging` or `production` DB

- `[ARC_LOCAL=1] npx sandbox [staging | --staging | production | --production]`
set the environment to `testing`, but still connect to your remote `staging` or `production` DB
