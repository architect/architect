/**
 * static
 * ---
 * validator for @static
 *
 * - asserts arc.static is an array of two tuples (say that three times fast)
 * - asserts the first element of the first tuple is 'staging'
 * - asserts the first element of the second tuple is 'production'
 */
module.exports = function static(arc/*, raw*/) {
  var errors = []
  if (arc.static) {
    // expect arc.static = [['staging', 'some-bukkit'], ['production', 'some-other-bukkit']]
    var validTypes = Array.isArray(arc.static) && Array.isArray(arc.static[0]) && Array.isArray(arc.static[1])
    var validStaging = validTypes && arc.static[0][0] === 'staging' && arc.static[0].length === 2
    var validProduction = validTypes && arc.static[1][0] === 'production' && arc.static[1].length === 2
    var validLocally = validStaging && validProduction
    if (!validLocally) {
      errors.push(Error('@static invalid'))
    }
  }
  return errors
}
