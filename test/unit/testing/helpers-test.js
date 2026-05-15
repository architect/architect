let test = require('tape')
let { deepCopy, mergeDeep, withDefaults } = require('../../../src/testing')

test('deepCopy creates independent copy', t => {
  t.plan(4)

  let original = { a: 1, b: { c: 2 } }
  let copy = deepCopy(original)

  t.deepEqual(copy, original, 'copy equals original')
  t.notEqual(copy, original, 'copy is not same reference')
  t.notEqual(copy.b, original.b, 'nested objects are independent')

  copy.b.c = 999
  t.notEqual(original.b.c, 999, 'modifying copy does not affect original')
})

test('deepCopy handles arrays', t => {
  t.plan(3)

  let original = { arr: [ 1, 2, 3 ] }
  let copy = deepCopy(original)

  t.deepEqual(copy.arr, original.arr, 'array copied correctly')
  t.notEqual(copy.arr, original.arr, 'array is independent')

  copy.arr.push(4)
  t.equal(original.arr.length, 3, 'modifying copied array does not affect original')
})

test('mergeDeep merges objects recursively', t => {
  t.plan(4)

  let target = { a: 1, b: { c: 2 } }
  let source = { b: { d: 3 }, e: 4 }
  let result = mergeDeep(target, source)

  t.equal(result.a, 1, 'preserves target properties')
  t.equal(result.b.c, 2, 'preserves nested target properties')
  t.equal(result.b.d, 3, 'adds source properties')
  t.equal(result.e, 4, 'adds top-level source properties')
})

test('mergeDeep does not mutate original', t => {
  t.plan(2)

  let target = { a: 1 }
  let source = { b: 2 }
  let result = mergeDeep(target, source)

  t.notEqual(result, target, 'returns new object')
  t.deepEqual(target, { a: 1 }, 'original target unchanged')
})

test('withDefaults applies defaults to partial object', t => {
  t.plan(3)

  let defaults = { a: 1, b: 2, c: 3 }
  let partial = { b: 20 }
  let result = withDefaults(partial, defaults)

  t.equal(result.a, 1, 'uses default for missing property')
  t.equal(result.b, 20, 'uses override for provided property')
  t.equal(result.c, 3, 'uses default for other properties')
})

test('withDefaults handles null/undefined partial', t => {
  t.plan(2)

  let defaults = { a: 1, b: 2 }
  let result1 = withDefaults(null, defaults)
  let result2 = withDefaults(undefined, defaults)

  t.deepEqual(result1, defaults, 'null partial returns defaults')
  t.deepEqual(result2, defaults, 'undefined partial returns defaults')
})

test('withDefaults works with nested objects', t => {
  t.plan(2)

  let defaults = { a: { b: 1, c: 2 } }
  let partial = { a: { b: 10 } }
  let result = withDefaults(partial, defaults)

  t.equal(result.a.b, 10, 'nested property overridden')
  t.equal(result.a.c, 2, 'nested property uses default')
})
