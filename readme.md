<p align=center>
  <a href=https://www.npmjs.com/package/@architect/architect>
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.arc.codes/architect-logo-light-500b@2x.png">
      <img alt="Architect Logo" src="https://assets.arc.codes/architect-logo-500b@2x.png">
    </picture>
  </a>
</p>

<p align=center><a href="https://github.com/architect/architect/actions?query=workflow%3A%22Node+CI%22"><img src=https://github.com/architect/architect/workflows/Node%20CI/badge.svg alt="GitHub CI status"></a> <a href="https://badge.fury.io/js/%40architect%2Farchitect"><img alt="npm version" src="https://badge.fury.io/js/%40architect%2Farchitect.svg"></a> <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="Apache-2.0 License"></a> <a href="https://discord.com/invite/y5A2eTsCRX"><img src="https://img.shields.io/discord/880272256100601927.svg?label=&logo=discord&logoColor=ffffff&color=5865F2&labelColor=grey"></a></p>

> Build ultra scalable database backed web apps on AWS serverless infrastructure with full local, offline workflows, and more. Full documentation found at: https://arc.codes


## Requirements

- **Platforms:** Linux, macOS, Windows
- **Architect runtime:** Node.js 18+
- **Function runtimes & package managers:**
  - Node.js (optional): [supported versions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
    - [`npm`](https://www.npmjs.com/) (optional): 10+
    - [`yarn`](https://yarnpkg.com/) (optional): 1+
  - Python (optional): [supported versions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
    - [`pip3`](https://pip.pypa.io/en/stable/) (optional)
  - Ruby (optional): [supported versions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
    - [`bundle`](https://bundler.io/) (optional)
- **Additional function runtimes:**
  - Java, .NET, Golang, Lambda runtime layers (optional): [supported versions](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)


## Installation

Make sure you have at least Node.js version 18 installed.

Open your terminal to install `arc`:

```bash
npm i @architect/architect --save-dev
```

Check the version:

```bash
npx arc version
```

> Protip: run `arc` with no arguments to get help


## Work locally

Create a new app:

```bash
mkdir testapp
cd testapp
npx arc init
```

Kick up the local dev server:

```bash
npx arc sandbox
```
> `Cmd / Ctrl + c` exits the sandbox


## Deploy to AWS

Deploy the `staging` stack:

```bash
npx arc deploy
```
> Protip: create additional `staging` stacks with `--name`

Ship to a `production` stack:

```bash
npx arc deploy --production
```


## Add Architect syntax to your text editor

– **[VS Code](https://marketplace.visualstudio.com/items?itemName=architect.architect)**

– **[Sublime Text](https://github.com/architect/sublime-package)**

– **[Vim](https://github.com/architect/vim-plugin)**


## Learn more

Head to https://arc.codes to learn more!


---

### Founding team

[Amber Costley](https://github.com/amberdawn), [Angelina Fabbro](https://github.com/afabbro), [Brian LeRoux](https://github.com/brianleroux), Jen Fong-Adwent, [Kristofer Joseph](https://github.com/kristoferjoseph), [Kris Borchers](https://github.com/kborchers), [Ryan Block](https://github.com/ryanblock), [Spencer Kelley](https://github.com/spencermountain)


### Special thanks

[Pinyao Guo](https://github.com/pug132) for the [Architect GitHub name](https://github.com/architect)
