@app
testapp

# for testing basic lambdas
@http
get /
get /foo

# test queue visability sync to timeout
@queues
aq

# test state enabled/disabled
@scheduled
sched rate(1 hour)
