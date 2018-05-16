module.exports = function getLongestSubject(lambdas) {
  let longest = 0
  lambdas.forEach(l=> {
    if (l.length > longest) longest = l.length
  })
  return longest + 4
}

