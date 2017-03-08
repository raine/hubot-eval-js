// Description:
//   eval

const inspect = require('util').inspect
const { concat, ifElse, isEmpty, join, mergeAll, pipe, reject, test } = require('ramda')
const { mdCode, mdPre, mdHeader } = require('./markdown')
const S = require('sanctuary')
const R = require('ramda')
const RF = require('ramda-fantasy')
const vm = require('vm')

const evalCode = (str) => {
  const output = []
  const console = {
    log: (arg) => {
      output.push(arg)
      return undefined
    }
  }
  const sandbox = mergeAll([ { R, S, console }, R, RF ])
  return {
    value: vm.runInNewContext(str, sandbox, {
      timeout: 10000
    }),
    output: output
  }
}

const nlMdCode = lang => pipe(mdCode(lang), concat('\n'))
const isMultiline = test(/\n/)
const inspectInfinite = (val) => inspect(val, { depth: Infinity })
const getErrorMessage = (e) => e.message || String(e)
const formatValueToReply = pipe(inspectInfinite, nlMdCode('js'))
const formatErrorToReply = pipe(getErrorMessage, ifElse(isMultiline, nlMdCode('text'), mdPre))

const formatOutput = (arr) =>
  join('\n', [
    mdHeader(4, 'output'),
    mdCode('', join('\n', arr))
  ])

const formatReply = (res) => {
  return join('\n', reject(isEmpty, [
    formatValueToReply(res.value),
    isEmpty(res.output) ? '' : formatOutput(res.output)
  ]))
}

const readEvaluateAndPrint = (res) => {
  try {
    // TODO: res.reply mentions user which is kind of useless
    res.reply(formatReply(evalCode(res.match[1])))
  } catch (e) {
    res.reply(formatErrorToReply(e))
  }
}

module.exports = (bot) => {
  bot.respond(/\s`([^`]+)`/, readEvaluateAndPrint)
  bot.respond(/```[a-z]*\n?((?:.|\n)+)\n?```/, readEvaluateAndPrint)
}
