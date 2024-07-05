const fs = require("fs");

/**
 * Loads google analytics credentials from the application config into a form
 * which can be used by the google SDK.
 */
class GoogleAnalyticsCredentialLoader {
  static analyticsCredentialsIndex = 0;

  /**
   * Gets google analytics credentials based on settings in the Config class.
   *
   * @param {AppConfig} appConfig an instance of the application config class
   * @returns {Object} a google analytics credential object with "email" and
   * "key" properties
   * @throws {Error} if no credentials are set in the application config
   */
  static getCredentials(appConfig) {
    if (appConfig.key) {
      return { key: appConfig.key, email: appConfig.email };
    } else if (appConfig.key_file) {
      return this._loadCredentialsFromKeyfile(appConfig);
    } else if (appConfig.analytics_credentials) {
      return this._loadCredentialsFromEnvironment(appConfig);
    } else {
      throw new Error("No key or key file specified in appConfig");
    }
  }

  static _loadCredentialsFromKeyfile(appConfig) {
    const keyfile = appConfig.key_file;
    if (!fs.existsSync(keyfile)) {
      throw new Error(`No such key file: ${keyfile}`);
    }

    let key = fs.readFileSync(keyfile).toString().trim();
    let email = appConfig.email;

    if (keyfile.match(/\.json$/)) {
      const json = JSON.parse(key);
      key = json.private_key;
      email = json.client_email;
    }
    return { key, email };
  }

  static _loadCredentialsFromEnvironment(appConfig) {
    const credentialData = JSON.parse(
      Buffer.from(appConfig.analytics_credentials, "base64").toString("utf8"),
    );
    const credentialsArray = this._wrapArray(credentialData);
    const index = this.analyticsCredentialsIndex++ % credentialsArray.length;
    return credentialsArray[index];
  }

  static _wrapArray(object) {
    return Array.isArray(object) ? object : [object];
  }
}

module.exports = GoogleAnalyticsCredentialLoader;
