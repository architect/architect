#!/usr/bin/env node
let fs = require('fs')
let chalk = require('chalk')
let init = require('../util/init')
let getCF = require('.')

init(function main(err, arc) {
  if (err) {
    console.log(err)
    console.log('hi ok')
  }
  else {
    // TODO has a bucket and a region configured
    // TODO has awscli installed
    // TODO has samcli installed
    // WARN about unsupported pragmas

    let config = getCF(arc)
    fs.writeFileSync('sam.json', JSON.stringify(config,null,2))

    // draw the deploy instructions
    let sam = chalk.bold.green(`sam package --template-file sam.json --output-template-file out.yaml --s3-bucket [S3 bucket]`)
    let cf = chalk.bold.green(`sam deploy --template-file out.yaml --stack-name [Stack Name] --s3-bucket [S3 bucket] --capabilities CAPABILITY_IAM`)
    let ugh = chalk.bold.yellow(`Update binary media types in the API Gateway console to */* and redeploy ¯\_(ツ)_/¯`)

    let x = process.platform.startsWith('win')? ' √' :'✓'
    let f = chalk.cyan.bold('sam.json')

    console.log(chalk.grey(`${x} Successfully created ${f}! Now deploy it by following these steps:

1.) Package code with SAM:
${sam}

2.) Deploy the CloudFormation stack:
${cf}

3.) Patch API Gateway BinaryMediaTypes
${ugh}
    `))
  }
})
