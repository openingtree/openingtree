const axios = require('axios')
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

window = {}

const tokenHost = 'https://oauth.lichess.org'
const tokenPath = '/oauth'
const redirectUri = `https://lichessloginworker.openingtree.com/`

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(req) {
  try {
    let params = getUrlVars(req.url)
    let code = params.code

    const tokenResponse = await getTokenResponse(code)
    //const userInfo = await getUserInfo(token.token);
    return new Response(JSON.stringify(tokenResponse), { status: 200 }) //res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo.data)}</pre>`);
  } catch (error) {
    console.error('Access Token Error', error.message)
    return new Response('avc+' + error.message, { status: 200 })
    //res.status(500).json('Authentication failed');
  }
}
function getUrlVars(url) {
  var vars = {}
  url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value
  })
  return vars
}

function getTokenResponse(code) {
  var bodyFormData = new FormData()
  bodyFormData.set('client_id', LICHESS_CLIENT_ID)
  bodyFormData.set('grant_type', 'authorization_code')
  return axios({
    method: 'post',
    url: tokenHost + tokenPath,
    data: bodyFormData,
    headers: { 'Content-Type': 'multipart/form-data' },
    adapter: require('axios/lib/adapters/http'),
  })
    .then(function(response) {
      //handle success
      console.log(response)
      return { test: 'success' }
    })
    .catch(function(error) {
      //handle error
      console.log(error)
      return { test1: JSON.stringify(error) }
    })
}
