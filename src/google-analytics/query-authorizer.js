const googleapis = require('googleapis')
const fs = require('fs')
const config = require('../config')
const GoogleAnalyticsCredentialLoader = require("./credential-loader")

const authorizeQuery = (query) => {
  const credentials = _getCredentials()
  const email = credentials.email
  const key = credentials.key
  const scopes = ['https://www.googleapis.com/auth/analytics.readonly']
  const jwt = new googleapis.auth.JWT(email, null, key, scopes);

  query = Object.assign({}, query, { auth: jwt })

  return new Promise((resolve, reject) => {
    jwt.authorize((err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(query)
      }
    })
  })
}

const _getCredentials = () => {
  if (config.key) {
    return { key: config.key, email: config.email }
  } else if (config.key_file) {
    return _loadCredentialsFromKeyfile(config.key_file)
  } else if (config.analytics_credentials) {
    return GoogleAnalyticsCredentialLoader.loadCredentials()
  } else {
    throw new Error("No key or key file specified in config")
  }
}

const _loadCredentialsFromKeyfile = (keyfile) => {
  if (!fs.existsSync(keyfile)) {
    throw new Error(`No such key file: ${keyfile}`)
  }

  let key = fs.readFileSync(keyfile).toString().trim()
  let email = config.email

  if (keyfile.match(/\.json$/)) {
    const json = JSON.parse(key)
    key = json.private_key
    email = json.client_email
  }
  return { key, email }
}

module.exports = { authorizeQuery }
