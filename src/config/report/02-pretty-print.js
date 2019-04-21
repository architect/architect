let chalk = require('chalk')

module.exports = function prettyprint(arc, raw, configs, callback) {

  let deltas = false

  configs.forEach(config=> {
    let {
      arcFile,
      timeout,
      memory,
      runtime,
      layers,
      state,
      concurrency,
      states,
      concurrencies,
      lambdas,
    } = config

    let defaults = {timeout, memory, runtime, state, concurrency}
    let margin = arcFile.length

    console.log(chalk.cyan.bold(arcFile))
    console.log(chalk.cyan.dim('timeout'.padStart(margin, ' ')), chalk.cyan(timeout))
    console.log(chalk.cyan.dim('memory'.padStart(margin, ' ')), chalk.cyan(memory))
    console.log(chalk.cyan.dim('runtime'.padStart(margin, ' ')), chalk.cyan(runtime))
    console.log(chalk.cyan.dim('state'.padStart(margin, ' ')), chalk.cyan(state))
    console.log(chalk.cyan.dim('concurrency'.padStart(margin, ' ')), chalk.cyan(concurrency))
    console.log('')

    let good = txt=> chalk.cyan(txt)
    let bad = txt=> chalk.white.bold.bgRed(txt)

    let results = {}
    lambdas.forEach(l=> {
      let name = l.FunctionName
      if (!results[name])
        results[name] = {}
      results[name].timeout = l.Timeout
      results[name].memory = l.MemorySize
      results[name].runtime = l.Runtime
    })
    if (states) {
      states.forEach(l=> {
        let name = l.Name
        if (!results[name])
          results[name] = {}
        results[name].state = l.State.toLowerCase()
      })
    }
    concurrencies.forEach(l=> {
      let name = l.name
      if (!results[name])
        results[name] = {}
      results[name].concurrency = l.concurrency
    })
    //TODO restore layers
    Object.keys(results).forEach(lambda=> {
      console.log(chalk.cyan.bold.dim(lambda.padStart(margin, ' ')))
      Object.keys(results[lambda]).forEach(prop=> {
        let defaultProp = defaults[prop]
        let actualProp = results[lambda][prop]
        if (defaultProp!=actualProp)
          deltas = true
        let txt = (defaultProp != actualProp)? bad(actualProp):good(actualProp)
        console.log(chalk.dim.cyan(prop.padStart(margin, ' ')), txt)
      })
      console.log('')
    })
  })

  if (deltas) {
    let grey = chalk.grey(`⚠️  To resolve config errors run `)
    let green = chalk.bgBlack.bold.green('npx config --apply')
    console.log(grey+green)
  }
  callback()
}
