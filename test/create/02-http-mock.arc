@app
testapp

@html
get /
#post /hi
#post /hi/nested
#get /hi/nested/:paramID
#post /hi/nested/:paramID

@json
get /nested/page
#post /nested/:paramID
#get /nested/:paramID/foo/:bar
