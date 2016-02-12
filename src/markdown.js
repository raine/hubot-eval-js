const { curry } = require('ramda')

const wrap = curry((x, s) => x + s + x)
exports.mdLink = curry((text, url) => `[${text}](${url})`)
exports.mdBold = wrap('**')
exports.mdStrike = wrap('~~')
exports.mdPre = wrap('`')
exports.mdCode = (str) => '```\n' + str + '\n```'
