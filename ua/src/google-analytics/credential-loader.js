const config = require("../config");

global.analyticsCredentialsIndex = 0;

const loadCredentials = () => {
  const credentialData = JSON.parse(
    Buffer.from(config.analytics_credentials, "base64").toString("utf8"),
  );
  const credentialsArray = _wrapArray(credentialData);
  const index = global.analyticsCredentialsIndex++ % credentialsArray.length;
  return credentialsArray[index];
};

const _wrapArray = (object) => {
  if (Array.isArray(object)) {
    return object;
  } else {
    return [object];
  }
};

module.exports = { loadCredentials };
