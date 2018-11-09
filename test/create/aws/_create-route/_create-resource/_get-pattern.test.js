var getPattern = require('../../../../../src/create/aws/_create-route/_create-resource/_get-pattern')
var test = require('tape')

test('create aws create-route+create-resource get-pattern redirects 302 properly', t=> {
  t.plan(7)
  t.ok(getPattern, 'getPattern exists')

  var threeOhTwo = new RegExp(getPattern('302'))
  t.ok(threeOhTwo, 'threeOhTwo')

  //console.log('/foo'.match(threeOhTwo))
  t.ok(threeOhTwo.test('/foo'))
  t.ok(threeOhTwo.test('/foo/bar/2?foo=bar&baz'))
  t.ok(threeOhTwo.test('https://wtfjs.com'))
  t.ok(threeOhTwo.test('http://wtfjs.com'))
  t.ok(threeOhTwo.test(JSON.stringify({statusCode:302, location:'http://wtfjs.com'})))
})
