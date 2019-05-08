@app
testapp

@tables
posts
  postID *String
  posted **String
  ttl TTL

ppl
  personID *String
  #insert Lambda
  #update Lambda
  #delete Lambda

data
  PK *String
  SK **String

@indexes
data
  GSI1PK *String
  GSI1SK **String

data
  GSI2PK *String
  GSI2SK **String

posts
  personID *String
