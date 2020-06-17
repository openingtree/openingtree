/* eslint-env module, node, commonjs */
process.env.NODE_ENV = 'testing'
const test = require('ava')
const dotenv = require('dotenv')
const fs = require('fs')
let testConfig = require(__dirname + `/../lib`).testConfig

test('should throw if Cloudflare site or zone-id not found', t => {
  const msg = `Cloudflare site/zone ID missing`
  let env = dotenv.parse(
    fs.readFileSync(`${__dirname}/fixtures/env/zone.test.env`)
  )
  return t.throws(() => testConfig(env), RegExp(msg))
})
// eslint-disable-next-line
function print(stuff) {
  return typeof stuff === 'string'
    ? console.info(stuff)
    : console.info(JSON.stringify(stuff, null, 1))
}
