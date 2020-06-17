const axios = require('axios');
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

window={}

const tokenHost = 'https://oauth.lichess.org';
const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth';

const redirectUri = `https://lichesslogin.openingtree.workers.dev`;
var ClientOAuth2 = require('client-oauth2')

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(req) {

  const oauth2 = new ClientOAuth2({
    clientId: LICHESS_CLIENT_ID,
    clientSecret: LICHESS_CLIENT_SECRET,
    accessTokenUri: tokenHost+tokenPath,
    authorizationUri: tokenHost+authorizePath,
    redirectUri: redirectUri,
    scopes: ['preferences:read']
  })/*simpleOAuth.create({
    client: {
      id: LICHESS_CLIENT_ID,
      secret: LICHESS_CLIENT_SECRET,
    },
    auth: {
      tokenHost,
      tokenPath,
      authorizePath,
    },
  });*/

  try {
    const token = await oauth2.code.getToken(req.url)
    //const userInfo = await getUserInfo(token.token);
    return new Response('success',{status:200})//res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo.data)}</pre>`);
  } catch(error) {
    console.error('Access Token Error', error.message);
    return new Response("abc+"+error.message,{status:200})
    //res.status(500).json('Authentication failed');
  }
}
function getUrlVars(url) {
  var vars = {};
  url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function getUserInfo(token) {
  return axios.get('/api/account', {
    baseURL: 'https://lichess.org/',
    headers: { 'Authorization': 'Bearer ' + token.access_token }
  });
}