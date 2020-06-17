/* eslint-env worker, browser, commonjs */

addEventListener(`fetch`, event => {
  event.respondWith(requestHandler(event.request))
})

async function requestHandler(request) {
  const response = await fetch(request)
  console.log(Buffer.from(await response.raw()))
  return response
}
