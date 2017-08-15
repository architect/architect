exports.handler = function index(event, context, callback) {
  var cookie = '_idx=6X_S19l3VLnN8RzhR9Hr55gt.CRAfQoCJ9Zy%2B4AyXcWx4l73BJvSuc%2FGi2vo41v7w%2B2Q; Max-Age=2291237795645; Expires=Sat, 09 Aug 2042 22:56:35 GMT; HttpOnly; Secure'
  callback(null, {html:'hello world', cookie})
}
