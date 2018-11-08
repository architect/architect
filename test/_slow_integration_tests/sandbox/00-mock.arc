@app
testapp

@html
get /

@json
get /api

@tables
accounts
  accountID *String

@indexes
accounts
  email *String
