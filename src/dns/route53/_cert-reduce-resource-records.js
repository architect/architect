module.exports = function _reduceResourceRecords({Certificate}) {
  let options = Certificate.DomainValidationOptions.map(function cleans(r) {
    return {
      name: r.ResourceRecord.Name,
      value: r.ResourceRecord.Value,
    }
  })
  // create a tmp obj for reducing to unqiue key/value pairs (ACM can return dups)
  let tmp = {}
  options.forEach(option=> {
    tmp[option.name] = true
  })
  // reduce to a final list that looks like this: [{name, value}]
  let reduced = Object.keys(tmp).map(k=> options.find(o=> o.name === k))
  return reduced
}
