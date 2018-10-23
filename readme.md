## [`@architect/architect`](https://www.npmjs.com/package/@architect/architect)
[ ![Codeship Status for arc-repos/architect](https://app.codeship.com/projects/6648b220-b6e0-0136-c44e-665f90db7339/status?branch=master)](https://app.codeship.com/projects/311665)

> Create, deploy, and maintain next-generation AWS cloud function-based serverless infrastructure with full local, offline workflows, and more.

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
