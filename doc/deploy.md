# npx deploy

Deploy Lambda functions and static content to AWS.

Deploy, unlike Create, is destructive: it will remorselessly overwrite cloud infrastructure under its purvue. 

Deploy will also reset individual lambda function dependencies based on the dependency manifest currently present (i.e. `node_modules/` to the contents of the local `package-lock.json`).

## Example Usage

- `npx deploy [staging | --staging | -s]` deploy all Lambda functions and static assets to `staging` 
- `npx deploy [staging | --staging | -s] src/html/get-index` deploy one Lambda function to `staging`
- `npx deploy [production | --production | -p]` deploy all Lambda functions and static content to `production` 
- `npx deploy [production | --production | -p] src/html/get-index` deploy one Lambda function to `production` 
