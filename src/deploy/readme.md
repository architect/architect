# Deploy command

Deploy encapsulates a lot of logic.

From a high level, deploy is a write operaton on two types of resources: Lambda functions and S3 buckets.

Deploy functionality is primarily implemented in `lambda-one` for lambda functions, and `public` for S3 operations.

`lambda-all` implements a batched queue that writes Lambdas as fast as the AWS console will allow.

Failed deployments are caught and `create` is be called for anything defined by `.arc` that does not have corresponding local code or remote infra.
