module.exports = function getLongestSubject(inventory) {
  let longest = `${inventory.app}-production`.length
  // lambda
  inventory.lambdas.forEach(l=> {
    if (l.length > longest) longest = l.length
  })
  // snstopics
  inventory.snstopics.forEach(l=> {
    if (l.length > longest) longest = l.length
  })
  // s3buckets
  inventory.s3buckets.forEach(l=> {
    if (l.length > longest) longest = l.length
  })
  // tables
  inventory.tables.forEach(l=> {
    if (l.length > longest) longest = l.length
  })
  return longest + 4
}

