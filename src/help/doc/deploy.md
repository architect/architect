# npx deploy

Deploy lambda functions to AWS


# Examples

- `npx deploy` deploy all lambdas in src to `staging`
- `npx deploy src/html/get-index` deploy one lambda to `staging`
- `npx deploy static` sync `.static` to the `staging` bucket
- `ARC_DEPLOY=production npx deploy` deploy all lambdas in src to `production`
