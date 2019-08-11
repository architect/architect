[<img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500>](https://www.npmjs.com/package/@architect/architect)

## [`@architect/architect`](https://www.npmjs.com/package/@architect/architect)

> Create, deploy, and maintain next-generation AWS cloud function-based serverless infrastructure with full local, offline workflows, and more.

[![Travis Build Status](https://travis-ci.com/architect/architect.svg?branch=master)](https://travis-ci.com/architect/architect) [![Appveyor Build Status](https://ci.appveyor.com/api/projects/status/xeq752lrapo7g93e/branch/master?svg=true)](https://ci.appveyor.com/project/ArchitectCI/architect/branch/master) [![codecov](https://codecov.io/gh/architect/architect/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/architect)


## Installation

### `npm`
```
npm i -g @architect/architect
```


### Binary Distributions

Coming soon! If you are interested in helping please let us know! Currently you can generate experimental binaries by cloning this repo and running `npm run build`.


## Usage

Run `arc` with no arguments to get help. To create a new app and kick up the local dev server:

```
mkdir testapp
cd testapp
arc init
arc sandbox
```

Package and deploy your app (via AWS CloudFormation):

```
arc deploy
```


### Learn more

Full docs found at https://arc.codes

[Architect changelog here](./changelog.md)


### Founding team

[Amber Costley](https://github.com/amberdawn), [Angelina Fabbro](https://github.com/afabbro), [Brian LeRoux](https://github.com/brianleroux), Jen Fong-Adwent, [Kristofer Joseph](https://github.com/kristoferjoseph), [Kris Borchers](https://github.com/kborchers), [Ryan Block](https://github.com/ryanblock), [Spencer Kelley](https://github.com/spencermountain)


### Special thanks

[Pinyao Guo](https://github.com/pug132) for the [Architect GitHub name](https://github.com/architect)
