/**
 * 1. yes, we are deliberately opting .arc users out of older runtimes; open to discussing in an issue!
 * 2. we will always support the runtimes below as long as aws does..
 */
let legit = [
  `nodejs8.10`,
  `python3.6`,
  `go1.x`,
  `dotnetcore2.1`,
  `java8`,
]

//
//TODO rust support (!)
//
//    https://github.com/srijs/rust-aws-lambda
//    (maybe we can solve this w patience)

module.exports = function allowed(maybe) {
  if (legit.includes(maybe))
    return maybe
  return legit[0]
}
