/* eslint-env module, node, commonjs */
process.env.NODE_ENV = 'testing'
const test = require('ava')
const dotenv = require('dotenv')
const fs = require('fs')
const { promisify } = require('util')
const webpack = promisify(require('webpack'))
let testConfig = require(__dirname + `/../lib`).testConfig

test('should error when using unshimmed Node builtins', async t => {
  const expectation = `Module failed because of a eslint error.`
  let env = dotenv.parse(
    fs.readFileSync(`${__dirname}/fixtures/env/eslint.test.env`)
  )
  env.fixture = `${__dirname}/fixtures/js/eslint.test.js`
  const config = testConfig()
  let stats = await webpack(config).then(result => result.toJson())
  return t.true(stats.errors.some(e => e.includes(expectation)))
})
// eslint-disable-next-line
function print(stuff) {
  return typeof stuff === 'string'
    ? console.info(stuff)
    : console.info(JSON.stringify(stuff, null, 1))
}
