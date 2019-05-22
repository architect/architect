#!/usr/bin/env node
let fs = require('fs')
let chalk = require('chalk')
let init = require('../util/init')
let config = require('.')

init(function main(err, arc) {
  if (err) console.log(err)
  else {
    // 
    // warn awscli installed
    // warn samcli installed
    // warn unsupported pragmas: ws, events, queues, scheduled, dns
    //
    fs.writeFileSync('sam.json', JSON.stringify(config(arc), null, 2))

    // draw the deploy instructions
    let pkg = `sam package --template-file sam.json --output-template-file out.yaml --s3-bucket [S3 bucket]`
    let dep = `sam deploy --template-file out.yaml --stack-name [Stack Name] --s3-bucket [S3 bucket] --capabilities CAPABILITY_IAM`
    let no = `Update binary media types in the API Gateway console to */* and redeploy ¯\\_(ツ)_/¯`

    let sam = chalk.bold.green(pkg)
    let cf = chalk.bold.green(dep)
    let ugh = chalk.bold.yellow(no)

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
