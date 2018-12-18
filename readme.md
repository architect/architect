[<img src="https://s3-us-west-2.amazonaws.com/arc.codes/architect-logo-500b@2x.png" width=500>](https://www.npmjs.com/package/@architect/architect)

## [`@architect/architect`](https://www.npmjs.com/package/@architect/architect)

> Create, deploy, and maintain next-generation AWS cloud function-based serverless infrastructure with full local, offline workflows, and more.

[![Build Status](https://travis-ci.com/arc-repos/architect.svg?branch=master)](https://travis-ci.com/arc-repos/architect)

## Quickstart
No AWS account required!

1. Create a vanilla Node project:

```bash
mkdir testapp
cd testapp
npm init --yes
```

2. Install Architect

```bash
npm i @architect/architect
```

3. Add a basic `.arc` file:

```arc
@app
testapp

@http
get /
```

4. Generate your project locally:

```bash
npx create local
```

5. Fire up the Architect sandbox to preview your work:

```bash
npx sandbox
```

To see all commands run:

```bash
npx help
```

> **Heads up:** be sure `npm uninstall @architect/workflows` if you're installing `@architect/architect` to an existing project


### Learn more

Full docs found at https://arc.codes

[Architect changelog here](./changelog.md)
