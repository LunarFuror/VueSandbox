/**
 * Created by grayson on 9/13/17.
 */
import decode from 'jwt-decode'
import auth0 from 'auth0-js'
import Router from 'vue-router'
const ID_TOKEN_KEY = 'id_token'
const ACCESS_TOKEN_KEY = 'access_token'

const CLIENT_ID = 'gsUd2zzRFzjeOBg4km5TUI97emK7HukD'
const CLIENT_DOMAIN = 'lunarfuror.auth0.com'
const REDIRECT_LOCAL = 'http://localhost:8080/callback'
const REDIRECT_LIVE = 'https://lunarsandbox.firebaseapp.com/callback'
const SCOPE = 'openid email profile'
const AUDIENCE = 'http://www.lunarfuror.com'
const USER_INFO = {}
const USER_NICKNAME = ''
const USER_EMAIL = ''

var auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: CLIENT_DOMAIN
})

export function login () {
  if (document.domain === 'localhost') {
    auth.authorize({
      responseType: 'token id_token',
      redirectUri: REDIRECT_LOCAL,
      audience: AUDIENCE,
      scope: SCOPE
    })
  } else {
    auth.authorize({
      responseType: 'token id_token',
      redirectUri: REDIRECT_LIVE,
      audience: AUDIENCE,
      scope: SCOPE
    })
  }
}

var router = new Router({
  mode: 'history'
})

export function logout () {
  clearIdToken()
  clearAccessToken()
  router.go('/')
}

export function requireAuth (to, from, next) {
  if (!isLoggedIn()) {
    next({
      path: '/',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

export function getIdToken () {
  return localStorage.getItem(ID_TOKEN_KEY)
}

export function getAccessToken () {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getUserInfo () {
  return localStorage.getItem(USER_INFO)
}

export function getUserNickname () {
  return localStorage.getItem(USER_NICKNAME)
}

export function getUserEmail () {
  return localStorage.getItem(USER_EMAIL)
}

function clearIdToken () {
  localStorage.removeItem(ID_TOKEN_KEY)
}

function clearAccessToken () {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName (name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash)
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}

// Get and store access_token in local storage
export function setAccessToken () {
  let accessToken = getParameterByName('access_token')
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

// Get and store id_token in local storage
export function setIdToken () {
  let idToken = getParameterByName('id_token')
  localStorage.setItem(ID_TOKEN_KEY, idToken)
}

export function isLoggedIn () {
  const idToken = getIdToken()
  return !!idToken && !isTokenExpired(idToken)
}

export function hashUser () {
  auth.parseHash({ hash: window.location.hash }, function (err, authResult) {
    if (err) {
      alert('err1')
      console.log(err)
    }

    auth.client.userInfo(authResult.accessToken, function (err, user) {
      if (err) {
        alert('err2')
        console.log(err)
      }
      localStorage.setItem(USER_INFO, user)
      localStorage.setItem(USER_NICKNAME, user.nickname)
      localStorage.setItem(USER_EMAIL, user.email)
      window.location.href = '/'
    })
  })
}

function getTokenExpirationDate (encodedToken) {
  const token = decode(encodedToken)
  if (!token.exp) { return null }

  const date = new Date(0)
  date.setUTCSeconds(token.exp)

  return date
}

function isTokenExpired (token) {
  const expirationDate = getTokenExpirationDate(token)
  return expirationDate < new Date()
}
