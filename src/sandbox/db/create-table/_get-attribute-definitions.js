  module.exports = function getAttributeDefinitions(attr) {
    var defs = [];
    Object.keys(attr).forEach(function(k, i) {
      defs[i] = {
        AttributeName: k,
        AttributeType: convert(attr[k].replace(/\*+/g, '')),
      };
    });

    return defs;
  }

function convert(v) {
  return ({
    'String':'S',
    'Number':'N'
  })[v];
}
