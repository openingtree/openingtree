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
    const html = `<html>
        <head>
          <script>
            function redirect(){
              window.location = 'https://www.openingtree.com/${decodeURIComponent(params.state)}?t=${tokenResponse.access_token}'
            }
          </script>
        </head>
        <body onload='redirect()'><div style='padding:20px;color:gray;text-align:center;margin-left:auto;margin-right:auto;'>This page should redirect automatically. If it does not, please <a href='https://www.openingtree.com/${decodeURIComponent(params.state)}?t=${tokenResponse.access_token}'>click here</a></div></body>
    </html>`
    let response = new Response(html, {
      headers:{
        'Content-type':'text/html'
      }
    })
    let date = new Date();
    date.setTime(date.getTime()+(30*24*60*60*1000));
    response.headers.set('Set-cookie',`rt=${tokenResponse['refresh_token']}; Domain=lichesslogin.openingtree.com; Path=refresh; Httponly; expires=${date.toGMTString()}`)
    return response
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
