addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

window = {}

const tokenHost = 'https://oauth.lichess.org'
const tokenPath = '/oauth'
const redirectUri = `https://lichesslogin.openingtree.com`
/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(req) {
  try {
    let params = getUrlVars(req.url)

    const tokenResponse = await getTokenResponse(params.code)
    if(tokenResponse.access_token) {
      return Response.redirect(`https://www.openingtree.com${params.state?decodeURIComponent(params.state):""}lichesslogin?t=${tokenResponse.access_token}`,302)
    } else {
      return Response.redirect(`https://www.openingtree.com${params.state?decodeURIComponent(params.state):""}`,302)
    }
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

async function getTokenResponse(code) {
  let formData = new FormData()
  formData.set('grant_type', 'authorization_code')
  formData.set('code', code)
  formData.set('redirect_uri',redirectUri)
  formData.set('client_id',LICHESS_CLIENT_ID)
  formData.set('client_secret',LICHESS_CLIENT_SECRET)
  
  let tokenRequest = new Request(tokenHost+tokenPath, {
    method:'POST',
    body:formData
  })
  
  let resp = await fetch(tokenRequest)
  return resp.json()

}
