the original system used email validation and sets up both route53 and apigateway side
old system issued two certs 

- new system just issues one cert with both domains (foo and *.foo.com)
- new system by default does not setup route53: that is opt in
- new 'basic' system creates cert and domain distributions: setting up cnames for both is up to the user to do with their dns provider
- new 'route53' optin creates a hosted zone in route53 (if it does not yet exist), then it attempts to create a cert and the CNAME records to verify it automatically,upon re-running it will create domain distributions and A records for them automatically 
- old system did not delete any resources
- new system allows you to delete the cert and domain distributions with `npx dns nuke`
- new sysetm opt in to delete hosted zone and all associated records with `ARC_NUKE=route53 npx dns nuke`

```arc
@app
testapp

@domain
foo.com
```

- `npx dns` setup a cert and create two cloudfront distributions; display CNAME values (but leave actual DNS as exercise for end user)
- `npx dns route53` opt into using route53 for everything
- `npx dns nuke` deletes the certificate and cloudfront distributions
- `ARC_NUKE=route53 npx dns nuke` opt into deletes route53 hosted zone, cnames and aliases
