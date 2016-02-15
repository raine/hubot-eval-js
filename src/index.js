// Description:
//   eval

const inspect = require('util').inspect
const { concat, mergeAll, pipe } = require('ramda')
const { mdCode, mdPre } = require('./markdown')
const S = require('sanctuary')
const R = require('ramda')
const RF = require('ramda-fantasy')
const vm = require('vm')

const evalCode = (str) => {
  const sandbox = mergeAll([ { R, S }, R, RF ])
  return vm.runInNewContext(str, sandbox, {
    timeout: 10000
  })
}

const formatValueToReply = pipe(inspect, mdCode('js'), concat('\n'))
const readEvaluateAndPrint = (res) => {
  try {
    res.reply(formatValueToReply(evalCode(res.match[1])))
  } catch (e) {
    res.reply(mdPre(e))
  }
}

module.exports = (bot) => {
  bot.respond(/\s`([^`]+)`/, readEvaluateAndPrint)
  bot.respond(/```[a-z]*\n?((?:.|\n)+)\n?```/, readEvaluateAndPrint)
}
