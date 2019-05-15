#!/usr/bin/env node
let fs = require('fs')
let chalk = require('chalk')
let init = require('../util/init')
let getCF = require('.')

init(function main(err, arc) {
  if (err) console.log(err)
  else {
    //TODO validate
    //- has a bucket
    //- has awscli installed
    //- has samcli installed
    let sam = chalk.green(`sam package --template-file template.json --output-template-file out.yaml --s3-bucket cf-sam-deployments-east`)
    let cf = chalk.green(`aws cloudformation deploy --template-file /Users/brianleroux/Repo/node-restful-api/out.yaml --stack-name FutzFive --s3-bucket cf-sam-deployments-east --capabilities CAPABILITY_IAM`)
    let config = getCF(arc)
    fs.writeFileSync('template.json', JSON.stringify(config,null,2))
    console.log(chalk.grey('nice work! package the code to s3 by running'))
    console.log(sam)
    console.log(chalk.grey('once that completes you can deploy by running'))
    console.log(cf)
  }
})
