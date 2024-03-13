const googleapis = require("googleapis");
const fs = require("fs");
const GoogleAnalyticsCredentialLoader = require("./credential-loader");

class GoogleAnalyticsQueryAuthorizer {
  #config;

  constructor(config) {
    this.#config = config;
  }

  authorizeQuery(query) {
    const credentials = this.#getCredentials();
    const email = credentials.email;
    const key = credentials.key;
    // https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport#authorization-scopes
    const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];
    const jwt = new googleapis.Auth.JWT(email, null, key, scopes);

    query = Object.assign({}, query, { auth: jwt });

    return new Promise((resolve, reject) => {
      jwt.authorize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(query);
        }
      });
    });
  }

  #getCredentials() {
    if (this.#config.key) {
      return { key: this.#config.key, email: this.#config.email };
    } else if (this.#config.key_file) {
      return this.#loadCredentialsFromKeyfile();
    } else if (this.#config.analytics_credentials) {
      return GoogleAnalyticsCredentialLoader.loadCredentials(this.#config);
    } else {
      throw new Error("No key or key file specified in config");
    }
  }

  #loadCredentialsFromKeyfile() {
    const keyfile = this.#config.key_file;
    if (!fs.existsSync(keyfile)) {
      throw new Error(`No such key file: ${keyfile}`);
    }

    let key = fs.readFileSync(keyfile).toString().trim();
    let email = this.#config.email;

    if (keyfile.match(/\.json$/)) {
      const json = JSON.parse(key);
      key = json.private_key;
      email = json.client_email;
    }
    return { key, email };
  }
}

module.exports = GoogleAnalyticsQueryAuthorizer;
