// Description:
//   eval

const inspect = require('util').inspect
const { concat, mergeAll, pipe, ifElse, test } = require('ramda')
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

const nlMdCode = lang => pipe(mdCode(lang), concat('\n'))
const isMultiline = test(/\n/)
const inspectInfinite = (val) => inspect(val, { depth: Infinity })
const getErrorMessage = (e) => e.message || String(e)
const formatValueToReply = pipe(inspectInfinite, nlMdCode('js'))
const formatErrorToReply = pipe(getErrorMessage, ifElse(isMultiline, nlMdCode('txt'), mdPre))
const readEvaluateAndPrint = (res) => {
  try {
    // TODO: res.reply mentions user which is kind of useless
    res.reply(formatValueToReply(evalCode(res.match[1])))
  } catch (e) {
    res.reply(formatErrorToReply(e))
  }
}

module.exports = (bot) => {
  bot.respond(/\s`([^`]+)`/, readEvaluateAndPrint)
  bot.respond(/```[a-z]*\n?((?:.|\n)+)\n?```/, readEvaluateAndPrint)
}
