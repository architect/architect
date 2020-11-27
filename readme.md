<p align=center><a href=https://www.npmjs.com/package/@architect/architect><img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500></a></p>

<p align=center><a href="https://github.com/architect/architect/actions?query=workflow%3A%22Node+CI%22"><img src=https://github.com/architect/architect/workflows/Node%20CI/badge.svg alt="GitHub CI status"></a> <a href="https://badge.fury.io/js/%40architect%2Farchitect"><img alt="npm version" src="https://badge.fury.io/js/%40architect%2Farchitect.svg"></a> <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="Apache-2.0 License"></a> <a href="https://join.slack.com/t/architecture-as-text/shared_invite/MjE2MzU4Nzg0NTY1LTE1MDA2NzgyMzYtODE2NzRkOGRmYw"><img alt="Join Architect Slack" src="https://img.shields.io/badge/Slack-join!-blue?style=flat&logo=slack"></a></p>

> Build ultra scalable database backed web apps on AWS serverless infrastructure with full local, offline workflows, and more. Full documentation found at: https://arc.codes

## Installation

Open your terminal to install `arc` globally:

```bash
npm i -g @architect/architect
```

Check the version:

```bash
arc version
```

> Protip: run `arc` with no arguments to get help

## Work locally

Create a new app:

```bash
mkdir testapp
cd testapp
arc init
```

Kick up the local dev server:

```bash
arc sandbox
```
> `Cmd / Ctrl + c` exits the sandbox

## Deploy to AWS

Deploy the `staging` stack:

```bash
arc deploy
```
> Protip: create additional `staging` stacks with `--name`

Ship to a `production` stack:

```bash
arc deploy production
```

Or eject to CloudFormation and deploy with the AWS SAM CLI:

```
arc package
sam package --template-file sam.json --output-template-file out.yaml --s3-bucket mybukkit
sam deploy --template-file out.yaml --stack-name MyStack --s3-bucket mybukkit --capabilities CAPABILITY_IAM
```

---

### Founding team

[Amber Costley](https://github.com/amberdawn), [Angelina Fabbro](https://github.com/afabbro), [Brian LeRoux](https://github.com/brianleroux), Jen Fong-Adwent, [Kristofer Joseph](https://github.com/kristoferjoseph), [Kris Borchers](https://github.com/kborchers), [Ryan Block](https://github.com/ryanblock), [Spencer Kelley](https://github.com/spencermountain)


### Special thanks

[Pinyao Guo](https://github.com/pug132) for the [Architect GitHub name](https://github.com/architect)
