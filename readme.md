<p align=center><a href=https://www.npmjs.com/package/@architect/architect><img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500></a></p>

<p align=center><a href="https://github.com/architect/architect/actions?query=workflow%3A%22Node+CI%22"><img src=https://github.com/architect/architect/workflows/Node%20CI/badge.svg alt="GitHub CI status"></a> <a href="https://badge.fury.io/js/%40architect%2Farchitect"><img alt="npm version" src="https://badge.fury.io/js/%40architect%2Farchitect.svg"></a> <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="Apache-2.0 License"></a> <a href="https://discord.com/invite/y5A2eTsCRX"><img src="https://img.shields.io/discord/880272256100601927.svg?label=&logo=discord&logoColor=ffffff&color=5865F2&labelColor=grey"></a></p>

> Build ultra scalable database backed web apps on AWS serverless infrastructure with full local, offline workflows, and more. Full documentation found at: https://arc.codes


## Installation

Make sure you have at least node version 14 installed.

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


## Add Architect syntax to your text editor

– **[VS Code](https://marketplace.visualstudio.com/items?itemName=architect.architect)**

– **[Sublime Text](https://github.com/architect/sublime-package)**

– **[Atom](https://atom.io/packages/language-architect)**


## Learn more

Head to https://arc.codes to learn more!


---

### Founding team

[Amber Costley](https://github.com/amberdawn), [Angelina Fabbro](https://github.com/afabbro), [Brian LeRoux](https://github.com/brianleroux), Jen Fong-Adwent, [Kristofer Joseph](https://github.com/kristoferjoseph), [Kris Borchers](https://github.com/kborchers), [Ryan Block](https://github.com/ryanblock), [Spencer Kelley](https://github.com/spencermountain)


### Special thanks

[Pinyao Guo](https://github.com/pug132) for the [Architect GitHub name](https://github.com/architect)
