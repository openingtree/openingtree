/* eslint-env node */
require('colors')
const dotenv = require('dotenv')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const { argv = {} } = require('yargs')

function bootstrap(env) {
  let isExample, printOutput

  // TODO: Add command line --help equivlent to print option definitions

  let {
    example: useExample,
    deploy,
    colors: useColors,
    emoji: useEmoji,
    metadataPath,
    workerSrc,
    silent: noVerbose,
    enabledPatterns,
    disabledPatterns,
    reset,
    debug,
    zone,
    site,
    minify,
    forceMinify,
  } = argv

  const envConfig = env || dotenv.parse(fs.readFileSync(resolve(`.env`)))

  for (let [key, val] of Object.entries(envConfig)) {
    if (val === '') delete envConfig[key]
    else process.env[key] = val
  }

  const {
    CLOUDFLARE_AUTH_EMAIL: cfEmail,
    CLOUDFLARE_AUTH_KEY: cfApiKey,
  } = process.env

  if (!cfEmail || !cfApiKey) {
    throw new Error(`Cloudflare credentials are missing!`)
  }

  isExample = !!ifDeclared(useExample, 'EXAMPLE_WORKER')
  useColors = ifDeclared(useColors, 'NO_COLORS', true)
  useEmoji = ifDeclared(useEmoji, 'NO_EMOJI', true)
  enabledPatterns = ifDeclared(enabledPatterns, 'ENABLED_PATTERNS')
  disabledPatterns = ifDeclared(disabledPatterns, 'DISABLED_PATTERNS')
  reset = Boolean(ifDeclared(reset, 'RESET_EVERYTHING'))
  debug = Boolean(ifDeclared(debug, 'DEBUG'))

  deploy = ifDeclared(deploy, 'NO_UPLOAD', true)
  zone = ifDeclared(zone, 'CLOUDFLARE_ZONE_ID')
  site = ifDeclared(site, 'CLOUDFLARE_SITE_NAME')
  minify =
    !!forceMinify || !!ifDeclared(deploy && minify, 'DO_NOT_MINIFY', true)
  metadataPath = ifDeclared(metadataPath, 'METADATA_PATH')
  if (!metadataPath && isExample)
    metadataPath = resolve('src/example.metadata.json')

  if (!site && !zone) {
    throw new Error(`Cloudflare site/zone ID missing!`)
  }

  metadataPath = reset ? null : metadataHandler(metadataPath, isExample)

  if (debug) process.env.DEBUG = 1

  printOutput = ifDeclared(noVerbose, 'NO_VERBOSE', true)

  if (process.env.NODE_ENV === 'testing') {
    workerSrc =
      env && env.fixture
        ? env.fixture
        : resolve(`test/fixtures/js/example.test.js`)
  } else {
    workerSrc = isExample
      ? resolve(`src/example.worker.js`)
      : workerSrc
      ? resolve(workerSrc)
      : resolve(`src/worker.js`)
  }

  const filename = `${isExample ? `example-worker` : `worker`}.js`

  let exampleGreeting
  if (isExample) {
    exampleGreeting = process.env.EXAMPLE_GREETING || 'Aloha'
  }

  let params = {
    cfEmail,
    cfApiKey,
    debug,
    deploy,
    disabledPatterns,
    enabledPatterns,
    exampleGreeting,
    filename,
    isExample,
    metadataPath,
    minify,
    printOutput,
    reset,
    site,
    useColors,
    useEmoji,
    workerSrc,
    zone,
  }
  logg.call(params, params)
  startupText.call(params)
  return params
}

function metadataHandler(metadataPath, isExample) {
  if (metadataPath) {
    metadataPath = path.relative(resolve(), metadataPath)
    let metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    let badJson
    for (let obj of metadata.bindings) {
      if ('namespace_id' in obj && !!obj.namespace_id === false) {
        badJson = true
        obj.remove = true
        console.error(
          [
            `ERROR!`,
            `You are attempting to bind a KV namespace, but the namespace_id`,
            `field is missing. Refer to the following link for instructions on`,
            `creating a KV namespace, and obtaining its ID:`,
            `https://developers.cloudflare.com/workers/api/resource-bindings/kv-namespaces/`,
          ].join(` `)
        )
        if (!isExample) throw new Error(`Missing namespace_id for KV binding`)
        else {
          console.warn(
            [
              `Example script deployment detected!`,
              `Removing offending resource binding... Please note that this`,
              `will FAIL for any other deployment attempt!`,
            ].join(` `)
          )
        }
      }
    }
    if (badJson) {
      mkdirp.sync(resolve(`/dist/tmp`))
      metadataPath = `dist/tmp/example.metadata.json`
      metadata.bindings = metadata.bindings.filter(obj => !obj.remove)
      fs.writeFileSync(resolve(metadataPath), JSON.stringify(metadata, null, 1))
      metadataPath = path.relative(resolve(), metadataPath)
    }
  }
  return metadataPath
}

function testConfig(env) {
  let configBuilder = require(resolve('webpack.config.js'))
  const conf = configBuilder(env)
  let { entry } = conf
  for (let rule of conf.module.rules) {
    if (rule.include) rule.include = entry
  }
  delete conf.stats
  return conf
}

function startupText() {
  if (process.env.NODE_ENV === 'testing') return
  let content = `Bundling ${
    this.isExample ? `Example` : `Cloudflare Worker`
  } script`

  content = this.useColors ? String(content).green : content

  let text = this.useEmoji ? `🚧  | ` : ``
  text += content

  console.info(text)
}

function logg(stuff) {
  return this.noVerbose
    ? void 0
    : !!this.debug && console.log(JSON.stringify(stuff, null, 2))
}

function resolve(_path = `.`) {
  return path.join(`${__dirname}/../`, _path)
}

function ifDeclared(val, envParam = '', invert = false) {
  let result
  if (val === undefined) {
    result = process.env[envParam.toUpperCase()]
    return invert ? !result : result
  }
  return val
}

module.exports.resolve = resolve
module.exports.bootstrap = bootstrap
module.exports.testConfig = testConfig
