[<img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500>](https://www.npmjs.com/package/@architect/architect)

## [`@architect/architect`](https://www.npmjs.com/package/@architect/architect)

> Create, deploy, and maintain next-generation AWS cloud function-based serverless infrastructure with full local, offline workflows, and more.

[![GitHub CI status](https://github.com/architect/architect/workflows/Node%20CI/badge.svg)](https://github.com/architect/architect/actions?query=workflow%3A%22Node+CI%22) [![Join Architect Slack](https://img.shields.io/badge/Slack-join!-blue?style=flat&logo=slack)](https://join.slack.com/t/architecture-as-text/shared_invite/MjE2MzU4Nzg0NTY1LTE1MDA2NzgyMzYtODE2NzRkOGRmYw)
<!-- [![codecov](https://codecov.io/gh/architect/architect/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/architect) -->


## Docs

Full documentation found at: https://arc.codes


## Installation

Open your terminal and install `arc` globally:

```bash
npm i -g @architect/architect
```

Check the version:

```bash
arc version
```

> Protip: run `arc` with no arguments to get help

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

Deploy to `staging`:

```bash
arc deploy
```

Ship to `production`:

```bash
arc deploy production
```

Eject to AWS SAM flavored CloudFormation:

```
arc package
```

### Founding team

[Amber Costley](https://github.com/amberdawn), [Angelina Fabbro](https://github.com/afabbro), [Brian LeRoux](https://github.com/brianleroux), Jen Fong-Adwent, [Kristofer Joseph](https://github.com/kristoferjoseph), [Kris Borchers](https://github.com/kborchers), [Ryan Block](https://github.com/ryanblock), [Spencer Kelley](https://github.com/spencermountain)


### Special thanks

[Pinyao Guo](https://github.com/pug132) for the [Architect GitHub name](https://github.com/architect)
