# npx deploy

Deploy functions (from `src/`) and static assets (from `public/`) to AWS Lambda and S3 respectively.

Deploy, unlike Create, is destructive: it will remorselessly overwrite cloud infrastructure under its purvue.

Deploy will also reset individual lambda function dependencies based on the dependency manifest currently present (i.e. `node_modules/` to the contents of the local `package-lock.json`).

Deploy will _not_ delete remote static assets from S3 that are not present locally in `public/` _unless the `--delete` flag is specified_. Deploy will only upload local files that have changed (have a newer last modified time locally than on S3).

## Example Usage

- `npx deploy [staging | --staging | -s]` deploy all Lambda functions and static assets to `staging`
- `npx deploy [staging | --staging | -s] src/html/get-index` deploy one Lambda function to `staging`
- `npx deploy [production | --production | -p]` deploy all Lambda functions and static assets to `production`
- `npx deploy [production | --production | -p] src/html/get-index` deploy one Lambda function to `production`
- `npx deploy static [staging | --staging | -s]` deploy only static assets to `staging`
- `npx deploy static [--prune | --delete] [staging | --staging | -s]` deploy only static assets to `staging` and prune assets on S3 that are not present locally in `public/`
- `npx deploy static [production | --production | -p]` deploy only static assets to `production`
