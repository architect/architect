/**
 * Extract layers from arc
 * - finds for `layers` array in json or yaml files
 * - finds for `layer` tuples in arc file and return a `layers` array
 */
module.exports = function getLayers(arc) {
  if (!arc || !arc.aws) return

  // `layers` can come from json or yaml
  let layers = arc.aws.find(tuple => tuple.includes('layers'))
  layers = layers && layers[1]

  // `layers` not found, let's check for `layer` tuples in .arc file
  if (!Array.isArray(layers)) {
    let layerTuples = arc.aws.filter(tuple => tuple.includes('layer'))
    if (layerTuples && layerTuples.length > 0) {
      layers = layerTuples.map(tuple => tuple[1])
    }
  }

  // Definitely we didn't found any layer
  if (!Array.isArray(layers)) return

  return layers
}
