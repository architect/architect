// TODO validate arc !!
// collect all errors and display gracefully
// html/json
// only get/post are supported
// routes must be unique
// routes must have a root route
// must be a tuple
// must be a valid url that starts with /
// must be unique tuples
// can declare express style url params
// html/json MUST have / route and it MUST be first
// slack can only have one endpoint identifiers must be url friendly string
module.exports = function validate(arc, callback) {
  callback(null, arc)
}
