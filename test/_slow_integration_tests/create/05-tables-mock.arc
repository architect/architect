@app
testapp

@tables
posts
  postID *String
  posted **String
  ttl TTL

@indexes
posts
  personID *String
