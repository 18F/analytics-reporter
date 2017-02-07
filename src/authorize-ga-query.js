const googleapis = require('googleapis')
const fs = require('fs')
const config = require('./config');

const authorizeGoogleAnalyticsQuery = (query) => {
  const email = config.email
  const key = getKey()
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

const getKey = () => {
  if (config.key) {
    return config.key
  } else if (config.key_file) {
    return loadKeyFromKeyfile(config.key_file)
  } else {
    throw new Error("No key or key file specified in config")
  }
}

const loadKeyFromKeyfile = (keyfile) => {
  if (!fs.existsSync(keyfile)) {
    throw new Error(`No such key file: ${keyfile}`)
  }

  let key = fs.readFileSync(keyfile).toString().trim()
  if (keyfile.match(/\.json$/)) {
    key = JSON.parse(key).private_key
  }
  return key
}

module.exports = authorizeGoogleAnalyticsQuery
