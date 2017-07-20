@app
testapp

@html
get /

@json
get /api

@tables
accounts
  accountID *String

notes
  accountID *String
  noteID **String

@indexes
accounts
  email *String
