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
   * @param {Config} config an instance of the application config class
   * @returns {Object} a google analytics credential object with "email" and
   * "key" properties
   * @throws {Error} if no credentials are set in the application config
   */
  static getCredentials(config) {
    if (config.key) {
      return { key: config.key, email: config.email };
    } else if (config.key_file) {
      return this._loadCredentialsFromKeyfile(config);
    } else if (config.analytics_credentials) {
      return this._loadCredentialsFromEnvironment(config);
    } else {
      throw new Error("No key or key file specified in config");
    }
  }

  static _loadCredentialsFromKeyfile(config) {
    const keyfile = config.key_file;
    if (!fs.existsSync(keyfile)) {
      throw new Error(`No such key file: ${keyfile}`);
    }

    let key = fs.readFileSync(keyfile).toString().trim();
    let email = config.email;

    if (keyfile.match(/\.json$/)) {
      const json = JSON.parse(key);
      key = json.private_key;
      email = json.client_email;
    }
    return { key, email };
  }

  static _loadCredentialsFromEnvironment(config) {
    const credentialData = JSON.parse(
      Buffer.from(config.analytics_credentials, "base64").toString("utf8"),
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
