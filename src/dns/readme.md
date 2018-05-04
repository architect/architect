# dns

api gateway urls are ok for prototyping but you'll quickly want to setup dns for a custom domain name. the manual steps to do this are fairly straightforward, however also automatable. and if something can be outomated it should be.

## setup

As with other workflows dns is setup with the following added to `scripts` in `package.json`:

```
{
  "dns": "AWS_PROFILE=xxx AWS_REGION=us-east-1 arc-dns"
}
```

This example `.arc` file defines `@domain` with the domain name `wut.click` as the value:

```arc
@app
testapp

@domain
wut.click

@html
get /
```

## usage

`npm run dns` and follow the guided output; you will have to re-run the command as you progress through the following stages of dns configuration:

- create and verify certificates with aws certificate manager
- setup hosted zone in route53
- create the domain and api mapping in api gateway
- create an alias record set in route53

as each phase progresses re-run `npm run dns` to move forward. 
