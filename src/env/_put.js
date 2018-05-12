let aws = require('aws-sdk')
let ssm = new aws.SSM

ssm.putParameter({
  Name: 'STRING_VALUE', /* required */
  Value: 'STRING_VALUE', /* required */
  Type: 'SecureString',
  Overwrite: true
}, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
})
