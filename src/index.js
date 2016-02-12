// Description:
//   eval

const S = require('sanctuary')
const inspect = require('util').inspect
const { merge, pipe } = require('ramda')
const { mdCode, mdPre } = require('./markdown')
const R = require('ramda')

const evalCode = (str) => {
  const VM = require('vm2').VM
  const sandbox = merge({ R, S }, R)
  const vm = new VM({ sandbox })
  return vm.run(str)
}

const formatValue = pipe(inspect, mdCode)
const readEvaluateAndPrint = (res) => {
  try {
    res.reply(formatValue(evalCode(res.match[1])))
  } catch (e) {
    res.reply(mdPre(e))
  }
}

module.exports = (bot) => {
  bot.respond(/\s`([^`]+)`/, readEvaluateAndPrint)
  bot.respond(/```[a-z]*\n?((?:.|\n)+)\n?```/, readEvaluateAndPrint)
}
