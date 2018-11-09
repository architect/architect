@app
testapp

@tables
posts
  postID *String
  posted **String
  ttl TTL

ppl
  personID *String
  insert Lambda
  update Lambda
  delete Lambda

@indexes
posts
  personID *String
