@app
hydrate

@http
get     /
get     /memories
post    /up/tents
put     /on_your_boots
delete  /badness-in-life

@views
get /
post /up/tents

@events
just-being-in-nature

@scheduled
hikes-with-friends rate(7 days)

@queues
parks-to-visit

@tables
trails
  trail *String
  insert Lambda
