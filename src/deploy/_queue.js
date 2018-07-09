/** implements a queue that accepts classic node errbacks, an optional timeout and fires a an errback when all the tasks complete; it differs from most implementations in that the queue runs to completion regardless of whether all tasks have yet completed. the usecase is when you want to fire a bunch of processes off at an interval but don't care so much about when each process itself completes (not a super common throttling scenario but it can happen) **/

module.exports = function Queue() {

  let queue = []
  let firstRun = true
  let length
  let results = []

  function getNext() {
    return queue.shift()
  }

  return {

    start(errback) {
      if (firstRun) {
        length = queue.length
        firstRun = false
      }
      let self = this
      if (queue.length > 0) {
        let {task, timeout} = getNext()
        setTimeout(function next() {
          task(function done(err, result) {
            if (err) {
              // reset the state and bail on error
              queue = []
              firstRun = true
              errback(err)
            }
            else {
              length -= 1
              results.push(result)
              if (queue.length === 0 && length === 0) {
                errback(null, results)
              }
            }
          })
          self.start(errback)
        }, timeout)
      }
    },

    add(task, timeout=0) {
      queue.push({task, timeout})
    }
  }
}
