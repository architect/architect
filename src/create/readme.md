# <kbd>:cloud_with_lightning: create</kbd>

> Generate local cloud function code and deployment infrastructure on AWS from an `.arc` text file

## usage

0. `npm i @architect/workflows --save`

1. Add `arc-create` to your npm scripts.


```javascript
// package.json
{
  "scripts": {
    "create": "AWS_PROFILE=xxx AWS_REGION=us-west-1 arc-create"
  }
}
```

2. Create an `.arc` file in your app root. `.arc` text files define your application architecture agnostic to :cloud: vendor infrastructure arcana.

```
# .arc
@app
mytestapp

@events
hit-counter

@html
get /
get /hello
post /hello

@json
get /notes
get /notes/:nodeID
post /notes
post /notes/:noteID
post /notes/:noteID/delete

@tables
accounts
  idx *String
  insert Lambda

@indexes
accounts
  email *String

@scheduled
email-blast rate(1 day)
```

3. Run `npm run create` to generate local code and remote Lambda deployments (infrastructure) for the architecture defined in `.arc`.

##### Generated Local Code 

Code that gets generated on your local file system that is immediately ready for live deployment to AWS Lambda.

```
  / 
  |-src
  | |
  | |-events
  | | '-hit-counter 
  | |
  | |-html
  | | |-get-index 
  | | |-get-hello
  | | '-post-hello
  | | 
  | |-json 
  | | |-get-notes
  | | |-get-notes-000noteID
  | | |-post-notes
  | | |-post-notes-000noteID
  | | '-post-notes-000noteID-delete
  | | 
  | |-tables 
  | | '-accounts-insert
  | | 
  | '-scheduled
  |   '-email-blast
  |
  |-.arc
  '-package.json

```  

##### Generated Staging Lambdas 

Already running Lambdas with `NODE_ENV` environment variable set to `staging`.

- `testapp-staging-hit-counter`
- `testapp-staging-get-index`
- `testapp-staging-get-hello`
- `testapp-staging-post-hello`
- `testapp-staging-get-notes`
- `testapp-staging-get-notes-000noteID`
- `testapp-staging-post-notes`
- `testapp-staging-post-notes-000noteID` 
- `testapp-staging-post-notes-000noteID-delete` 
- `testapp-staging-accounts-insert`
- `testapp-staging-email-blast`

#### Generated Production Lambdas

Already running Lambdas with `NODE_ENV` environment variable set to `production`.

- `testapp-production-hit-counter`
- `testapp-production-get-index`
- `testapp-production-get-hello`
- `testapp-production-post-hello`
- `testapp-production-get-notes`
- `testapp-production-get-notes-000noteID`
- `testapp-production-post-notes`
- `testapp-production-post-notes-000noteID`
- `testapp-production-post-notes-000noteID-delete`
- `testapp-production-accounts-insert`
- `testapp-production-email-blast`
