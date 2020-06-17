/* eslint-env module, node, commonjs */
process.env.NODE_ENV = 'testing'
const test = require('ava')
const dotenv = require('dotenv')
const fs = require('fs')
let testConfig = require(__dirname + `/../lib`).testConfig

test('should throw if Cloudflare credentials not found', t => {
  const msg = `Cloudflare credentials are missing`
  const env = dotenv.parse(
    fs.readFileSync(`${__dirname}/fixtures/env/credentials.test.env`)
  )
  return t.throws(() => testConfig(env), RegExp(msg))
})

function print(stuff) { // eslint-disable-line
  return typeof stuff === 'string'
    ? console.info(stuff)
    : console.info(JSON.stringify(stuff, null, 1))
}
