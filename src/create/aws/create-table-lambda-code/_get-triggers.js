module.exports = function getTriggers(attr) {
  var triggers = []
  Object.keys(attr).forEach(k=> {
    if (attr[k] === 'Lambda') {
      triggers.push(k)
    }
  })
  return triggers.length > 0? triggers : false
}
