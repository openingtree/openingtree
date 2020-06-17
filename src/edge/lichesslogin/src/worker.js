/* eslint-env worker, browser, commonjs */
/* globals INJECTED_VARIABLE GREETING helloNamespace */

// `require()`ed modules and our Worker script are bundled into a single script
//  at build time Alternatively, you can use import statements, e.g.: import
//  sample from 'lodash.sample'
const sample = require(`lodash.sample`)

// This is our worker's listener function
addEventListener(`fetch`, event => {
  event.respondWith(requestHandler(event.request))
})

// Our main function which handles requests
async function requestHandler(request) {
  // First, fetch the original request data
  const response = await fetch(request)

  // A random 'hello' from out helper function
  const hello = await utilityFunction()
  const greeting = `${hello}, world!`

  // Create a new Headers object for our modified response
  const modifiedHeaders = new Headers(response.headers)

  // Set our greeting header in the modified response
  modifiedHeaders.set(`x-worker-greeting`, greeting)

  // Complete configuration for our modified response
  const modifiedResponseOptions = {
    status: response.status,
    statusText: response.statusText,
    headers: modifiedHeaders,
  }

  // return the original content with our modified response options
  return new Response(response.body, modifiedResponseOptions)
}

// A simple helper function for the requestHandler
async function utilityFunction() {
  const hellos = [
    'Hello',
    'Konnichi wa',
    'Goedendag',
    'Bonjour',
    'Shalom',
    'Buonguiorno',
    'Dzien dobry',
    'Moin moin',
    'Alo',
    'Gauden Dag',
    'Privet',
    'Hola',
    'God dag',
    'Xin chao',
  ]

  try {
    if (INJECTED_VARIABLE) {
      /*
        Below is EXAMPLE_GREETING found in the .env config file (default: 'Guten
        Tag') It's passed via webpack.config.js to Webpack, which then injects
        the greeting upon build
      */
      hellos.push(INJECTED_VARIABLE)
    }

    if (GREETING) {
      /*
        Below is the secret variable GREETING found in src/example.metadata.json
        (default: 'Howdy') The 'secret' is stored in the Cloudflare Worker
        Secrets Vault and automatically injected when the script is executed.
      */
      hellos.push(GREETING)
    }

    if (helloNamespace) {
      /*
        Below is the kv_greeting (default: 'Miten menee') found in our
        helloNamespace namespace, which we bind to the worker via
        example.metadata.json. The KV
      */
      hellos.push(await helloNamespace.get(`kv_greeting`))
    }
  } catch (err) {
    console.error(err)
  }
  // Here, we use the lodash.sample module that we 'required' above
  return sample(hellos)
}
