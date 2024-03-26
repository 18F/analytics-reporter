const googleapis = require("googleapis");
const GoogleAnalyticsCredentialLoader = require("./credential_loader");

class GoogleAnalyticsQueryAuthorizer {
  /**
   * @param {Object} query the query object for the google analytics reporting
   * API.
   * @param {Config} config an application config instance.
   * @returns {Object} the query object with current authorization JWT included.
   */
  static authorizeQuery(query, config) {
    const credentials = GoogleAnalyticsCredentialLoader.getCredentials(config);
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
}

module.exports = GoogleAnalyticsQueryAuthorizer;
