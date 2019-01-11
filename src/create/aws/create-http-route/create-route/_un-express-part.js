// helper to swap express style :paramID for api gateway style {paramID}
module.exports = function unexpressPart(part) {
  var isParam = part[0] === ':'
  if (isParam) {
    return `{${part.replace(':', '')}}`
  }
  else {
    return part
  }
}
