/* eslint-env worker, browser, commonjs */
/* globals */ // list injected variables after 'globals'
const axios = require('axios')
const ClientOAuth2 = require('client-oAuth2')

addEventListener(`fetch`, event => {
  event.respondWith(requestHandler(event.request))
})

const tokenHost = 'https://oauth.lichess.org';
const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth';

const redirectUri = `https://lichesslogin.openingtree.workers.dev`;

async function requestHandler(request) {
  // Do awesome stuff here

  const oauth2 = new ClientOAuth2({
    clientId: "LICHESS_CLIENT_ID",
    clientSecret: "LICHESS_CLIENT_SECRET",
    accessTokenUri: tokenHost+tokenPath,
    authorizationUri: tokenHost+authorizePath,
    redirectUri: redirectUri,
    scopes: ['preferences:read']
  })
  try {
    const token = await oauth2.code.getToken(request.url)
    //const userInfo = await getUserInfo(token.token);
    return new Response('success',{status:200})//res.send(`<h1>Success!</h1>Your lichess user info: <pre>${JSON.stringify(userInfo.data)}</pre>`);
  } catch(error) {
    console.error('Access Token Error', error.message);
    return new Response("abc+"+error.message,{status:200})
    //res.status(500).json('Authentication failed');
  }
}
