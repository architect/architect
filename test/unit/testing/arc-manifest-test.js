let test = require('tape')
let { createMockArcManifest, createMockDeployConfig } = require('../../../src/testing')

test('createMockArcManifest returns valid object', t => {
  t.plan(3)

  let manifest = createMockArcManifest()

  t.ok(manifest, 'manifest exists')
  t.equal(manifest.app, 'test-app', 'has default app name')
  t.ok(Array.isArray(manifest.http), 'http is array')
})

test('createMockArcManifest has required properties', t => {
  t.plan(2)

  let manifest = createMockArcManifest()

  t.ok(manifest.env, 'has env property')
  t.equal(manifest.http.length, 1, 'has default http route')
})

test('createMockArcManifest accepts app override', t => {
  t.plan(1)

  let manifest = createMockArcManifest({ app: 'my-app' })

  t.equal(manifest.app, 'my-app', 'app overridden')
})

test('createMockArcManifest accepts http override', t => {
  t.plan(2)

  let manifest = createMockArcManifest({ http: [ 'post /api', 'get /status' ] })

  t.equal(manifest.http.length, 2, 'http routes updated')
  t.equal(manifest.http[0], 'post /api', 'http routes correct')
})

test('createMockArcManifest accepts env override', t => {
  t.plan(2)

  let manifest = createMockArcManifest({
    env: { CUSTOM_VAR: 'value' },
  })

  t.equal(manifest.env.testing, 'SECRET_VALUE', 'preserves default env')
  t.equal(manifest.env.CUSTOM_VAR, 'value', 'adds custom env vars')
})

test('createMockArcManifest accepts multiple overrides', t => {
  t.plan(3)

  let manifest = createMockArcManifest({
    app: 'production-app',
    http: [ 'put /resource/:id' ],
    env: { API_KEY: 'secret' },
  })

  t.equal(manifest.app, 'production-app', 'app overridden')
  t.equal(manifest.http[0], 'put /resource/:id', 'http overridden')
  t.equal(manifest.env.API_KEY, 'secret', 'env overridden')
})

test('createMockDeployConfig returns valid object', t => {
  t.plan(3)

  let config = createMockDeployConfig()

  t.ok(config, 'config exists')
  t.equal(config.stage, 'staging', 'has default stage')
  t.equal(config.region, 'us-west-2', 'has default region')
})

test('createMockDeployConfig has required properties', t => {
  t.plan(2)

  let config = createMockDeployConfig()

  t.ok(config.cloudformation, 'has cloudformation property')
  t.ok(config.cloudformation.AWSTemplateFormatVersion, 'cloudformation is valid template')
})

test('createMockDeployConfig accepts stage override', t => {
  t.plan(1)

  let config = createMockDeployConfig({ stage: 'production' })

  t.equal(config.stage, 'production', 'stage overridden')
})

test('createMockDeployConfig accepts region override', t => {
  t.plan(1)

  let config = createMockDeployConfig({ region: 'eu-west-1' })

  t.equal(config.region, 'eu-west-1', 'region overridden')
})

test('createMockDeployConfig accepts CloudFormation override', t => {
  t.plan(1)

  let customCfn = {
    AWSTemplateFormatVersion: '2010-09-09',
    Resources: { CustomResource: { Type: 'AWS::S3::Bucket' } },
  }
  let config = createMockDeployConfig({ cloudformation: customCfn })

  t.equal(
    config.cloudformation.Resources.CustomResource.Type,
    'AWS::S3::Bucket',
    'cloudformation overridden',
  )
})

test('createMockDeployConfig accepts multiple overrides', t => {
  t.plan(3)

  let config = createMockDeployConfig({
    stage: 'prod',
    region: 'ap-northeast-1',
    cloudformation: { Resources: {} },
  })

  t.equal(config.stage, 'prod', 'stage correct')
  t.equal(config.region, 'ap-northeast-1', 'region correct')
  t.deepEqual(config.cloudformation.Resources, {}, 'cloudformation correct')
})
