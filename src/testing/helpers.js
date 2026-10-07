/**
 * Testing utilities helper functions
 */

/**
 * Deep copy an object (simple implementation using JSON)
 * @param {Object} obj - Object to copy
 * @returns {Object} Deep copy of object
 */
function deepCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Recursively merge source into target
 * @param {Object} target - Target object
 * @param {Object} source - Source object with overrides
 * @returns {Object} Merged object
 */
function mergeDeep (target, source) {
  let result = deepCopy(target)

  for (let key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = mergeDeep(result[key], source[key])
        }
        else {
          result[key] = deepCopy(source[key])
        }
      }
      else {
        result[key] = source[key]
      }
    }
  }

  return result
}

/**
 * Apply defaults to partial object
 * @param {Object} partial - Partial object with overrides
 * @param {Object} defaults - Default values
 * @returns {Object} Merged object with defaults applied
 */
function withDefaults (partial, defaults) {
  return mergeDeep(defaults, partial || {})
}

module.exports = {
  deepCopy,
  mergeDeep,
  withDefaults,
}
