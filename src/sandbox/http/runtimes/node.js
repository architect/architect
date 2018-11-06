let fn = require('./index').handler;
let event = JSON.parse(process.env.__ARC_REQ__);

function callback(err, result) {
  let payload = err? {name:err.name, message:err.message, stack:err.stack} : result;
  console.log('__ARC__', JSON.stringify(payload));
}

var context = {
  succeed(x) {
    callback(null, x)
  },
  fail(x) {
    callback(x)
  }
};

if (fn.constructor.name === 'AsyncFunction') {
  fn(event, context, callback).then(function win(result) {
    callback(null, result);
  }).catch(callback);
}
else {
  fn(event, context, callback);
}

