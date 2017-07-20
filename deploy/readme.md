# <kbd>:cloud_with_lightning: @architect/deploy</kbd>

> Deploys cloud functions defined by `.arc` in `./src` to `staging` and, with an extra manual step, `production`

### install

```
npm i @architect/deploy --save-dev
```

## setup

Add `arc-deploy` to your npm scripts.

```javascript
// package.json
{
  "scripts": {
    "deploy": "arc-deploy"
  }
}
```

## usage

To deploy everything in `./src` run:

```
npm run deploy
```

Deploy a single function by passing the path to it as an argument:

```
npm run deploy src/html/get-index
```

## Deploy to Production

```
ARC_DEPLOY=production npm run deploy
```
