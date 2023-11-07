const config = require("../config")
const winston = require('winston');
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
  });

global.analyticsCredentialsIndex = 0

const loadCredentials = () => {
  const credentialData = JSON.parse(config.analytics_credentials)
  logger.info('in loadCredentials'+credentialData);
  const credentialsArray = _wrapArray(credentialData)
  const index = global.analyticsCredentialsIndex++ % credentialsArray.length
  return credentialsArray[index]
}

const _wrapArray = (object) => {
  if (Array.isArray(object)) {
    return object
  } else {
    return [object]
  }
}

module.exports = { loadCredentials }
