module.exports = function validate(arc, callback) {

  // setup error queue
  var errors = []

  if (arc.html) {
    // TODO must be a tuple
    // TODO routes[0] must be either get or post
    // TODO routes[1] must be a valid url that starts with /
    // TODO routes[1] must not end in /
    // TODO routes must be unique
  }

  if (arc.static) {
    // expect arc.static = [['staging', 'some-bukkit'], ['production', 'some-other-bukkit']]
    var validTypes = Array.isArray(arc.static) && Array.isArray(arc.static[0]) && Array.isArray(arc.static[1])
    var validStaging = validTypes && arc.static[0][0] === 'staging' && arc.static[0].length === 2
    var validProduction = validTypes && arc.static[1][0] === 'production' && arc.static[1].length === 2
    var validLocally = validStaging && validProduction
    // TODO check staging has a valid bucket name
    // TODO check production has a valid bucket name
    if (!validLocally) {
      errors.push(Error('@static invalid'))
    }
  }

  // continue if everything is ok
  let ok = errors.length === 0
  if (ok) {
    callback(null, arc)
  }
  else {
    callback(errors)
  }
}
