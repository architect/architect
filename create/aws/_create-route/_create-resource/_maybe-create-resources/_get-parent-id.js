var unexpress = require('../_un-express-part')

module.exports = function findParentID(part, resources) {
  var parts = part.split('/').map(unexpress)
  parts.pop()
  var parental = parts.join('/') === ''? '/' : parts.join('/')
  var resource = resources.items.find(r=> r.path === parental)
  return resource.id
}
