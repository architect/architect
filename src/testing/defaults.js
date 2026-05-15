/**
 * Default mock values for testing Architect plugins
 */

let DEFAULT_ARC_MANIFEST = {
  app: 'test-app',
  http: [
    'get /',
  ],
  env: {
    testing: 'SECRET_VALUE',
  },
}

let DEFAULT_INVENTORY = {
  app: 'test-app',
  env: {
    testing: 'SECRET_VALUE',
  },
  http: [
    {
      method: 'GET',
      path: '/',
      src: 'src/http/get-index',
    },
  ],
  inv: {},
  lambdaVersions: {},
  get: function (type) {
    if (type === 'http') {
      return this.http[0]
    }
    return undefined
  },
}

let DEFAULT_DEPLOY_CONTEXT = {
  stage: 'staging',
  region: 'us-west-2',
  cloudformation: {
    AWSTemplateFormatVersion: '2010-09-09',
    Transform: 'AWS::Serverless-2016-10-31',
    Parameters: {},
    Resources: {},
    Outputs: {},
  },
}

let DEFAULT_LAMBDA_INVOCATION = {
  requestContext: {
    http: {
      method: 'GET',
      path: '/',
      sourceIp: '127.0.0.1',
    },
    routeKey: 'GET /',
  },
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({}),
}

let DEFAULT_PLUGIN_CONTEXT = {
  arc: DEFAULT_ARC_MANIFEST,
  inventory: DEFAULT_INVENTORY,
  deploySandbox: false,
}

module.exports = {
  DEFAULT_ARC_MANIFEST,
  DEFAULT_INVENTORY,
  DEFAULT_DEPLOY_CONTEXT,
  DEFAULT_LAMBDA_INVOCATION,
  DEFAULT_PLUGIN_CONTEXT,
}
