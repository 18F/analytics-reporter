/**
 * Loads google analytics credentials from the application config into a form
 * which can be used by the google SDK.
 */
class GoogleAnalyticsCredentialLoader {
  static analyticsCredentialsIndex = 0;

  /**
   *
   * @param {Config} config an instance of the application config class
   * @returns {Object} a google analytics credential object
   */
  static loadCredentials(config) {
    const credentialData = JSON.parse(
      Buffer.from(config.analytics_credentials, "base64").toString("utf8"),
    );
    const credentialsArray = this._wrapArray(credentialData);
    const index = global.analyticsCredentialsIndex++ % credentialsArray.length;
    return credentialsArray[index];
  }

  static _wrapArray(object) {
    return Array.isArray(object) ? object : [object];
  }
}

module.exports = GoogleAnalyticsCredentialLoader;
