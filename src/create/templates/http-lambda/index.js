exports.handler = async function http(request) {
  try {
 // throw Error('oh no')
 /*
   return {
     body: "<b><i>hi", //+ `<pre>${JSON.stringify(e, null, 2)}`,
     status: 202,
     type: 'text/html',
     cors: true,
   }
 */
 /*
   return {
     body: JSON.stringify({hello:1, 'whee':2, hi:'two'}),
     status: 201,
     type: 'application/json',
   }
 */
 /*
   return {
     status: 302,
     location: '/staging/about'
   }
 */
    return {
      status:203,
      type:'text/html',
      body:'<h1>hi</h1><pre>'+JSON.stringify(request, null, 2),
      cors: true
    }
  }
  catch(e) {
    return {
      status: 500,
      type: 'application/json; charset=utf8',
      body: JSON.stringify({
        name: e.name,
        message: e.message,
        stack:e.stack
      }, null, 2)
    }
  }
}
