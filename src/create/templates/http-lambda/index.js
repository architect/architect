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
      status: 201,
      cors: true,
      type: 'application/json',
      body: JSON.stringify({hello:1, 'whee':2, hi:'two'}),
    }
    */
    /*
    return {
      status: 302,
      location: '/staging/about'
    }
    */
    let req = JSON.stringify(request, null, 2)
    return {
      status: 201,
      type: 'text/html; charset=utf8',
      body: `
        <h1>hello world!</h1>
        <pre>${req}</pre>
      `
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
