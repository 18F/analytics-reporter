const googleapis = require("googleapis");
const GoogleAnalyticsCredentialLoader = require("./credential_loader");

/**
 * Handles authorization for queries to the Google Analytics Data API.
 */
class GoogleAnalyticsQueryAuthorizer {
  /**
   * @param {Object} query the query object for the google analytics reporting
   * API.
   * @param {AppConfig} appConfig an application config instance.
   * @returns {Object} the query object with current authorization JWT included.
   */
  static authorizeQuery(query, appConfig) {
    const credentials =
      GoogleAnalyticsCredentialLoader.getCredentials(appConfig);
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
