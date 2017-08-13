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

@js
/index.js        # generates src/js/index
/page/contact.js # generates src/js/page-contact    

@css
/theme/dark.css # .js or .css is optional, but I think it reads better
