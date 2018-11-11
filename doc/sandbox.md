# npx sandbox

Preview your arc application locally.

This command will run local services that stand in for their remote equivalents, such as:

- a local in-memory database (in place of e.g. DynamoDB)
- a local pub/sub service (in place of e.g. SNS)
- mounts your functions to be accessible locally over HTTP (in place of e.g. Lambda)

## Example Usage

- `npx sandbox` runs `sandbox` locally and in-memory, connecting to sandbox DB
- `npx sandbox [staging | --staging | production | --production]` sets the environment to `staging` or `production`, and connects to your remote `staging` or `production` DB
- `[ARC_LOCAL=1] npx sandbox [staging | --staging | production | --production]` sets the environment to `testing`, but still connects to your remote `staging` or `production` DB
