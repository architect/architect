let aws = require('aws-sdk')

module.exports = function create(name, callback) {
  let gateway = new aws.ApiGatewayV2({region: process.env.AWS_REGION})
  waterfall([
    function createApi(callback) {
      gateway.createApi({
        Name: name,
        ProtocolType: 'WEBSOCKET',
        RouteSelectionExpression: '$request.body.message',
      }, callback)
    },
    function createRoute(api, callback) {
      gateway.createRoute( {
        ApiId: 'STRING_VALUE', /* required */
        RouteKey: 'STRING_VALUE', /* required */
        RouteResponseSelectionExpression: 'STRING_VALUE',
        Target: 'STRING_VALUE'
      }, 
      function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
    
    }
  ],
  function done(err, result) {
    if (err) callback(err)
    else {
      // setup connect, disconnect and default lambdae 
    }
  })
}
