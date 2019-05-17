module.exports = function statics(arc, result) {
  // idk if this is what we want to do…but we need the bucketname and it needs be lowcase
  let BucketName = `${arc.app[0]}-static-bucket`
  result.StaticBucket = {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName,
      AccessControl: 'PublicRead',
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
        ErrorDocument: '404.html'
      }
    }
  }
  //TODO check for api and then bind _static if it exists
  return result
}
