const winston = require("winston");

/**
 * @param {import('../app_config')} appConfig the application config
 * @param {object} reportConfig the name of the report currently being processed
 * @param {string} reportConfig.name the name of the report being run for this
 * logger instance.
 * @returns {string} a standard tag for the logger to identify the specific
 * report being processed when writing logs.
 */
const tag = ({ agencyName, reportName, scriptName }) => {
  let tagString = "";

  if (scriptName) {
    tagString = tagString + `${scriptName} - `;
  }
  if (reportName) {
    tagString = tagString + `${reportName} - `;
  }
  if (agencyName) {
    tagString = tagString + `${agencyName}`;
  }

  return tagString;
};

const logLevel = process.env.ANALYTICS_LOG_LEVEL || "debug";
const baseLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.printf(
    (logArgs) =>
      `${winston.format.colorize().colorize(logArgs.level, logArgs.level)}: ${logArgs.label ? `[${logArgs.label}]` : ``} ${logArgs.message}`,
  ),
  transports: [
    new winston.transports.Console({
      level: logLevel,
    }),
  ],
});

/**
 * Creates an application logger instance.
 *
 * @param {import('../app_config')} appConfig application config instance. Sets the log level and
 * is also referenced to create a leading log tag for this logger instance.
 * @param {object} reportConfig config for the report being run for this
 * logger instance. Used to create a leading log tag for messages
 * @param {string} reportConfig.name the name of the report being run for this
 * logger instance. Used to create a leading log tag for messages
 * @returns {import('winston').Logger} the configured logger instance
 */
const initialize = (appConfig = {}, reportConfig = {}) => {
  return baseLogger.child({
    label: tag({
      agencyName: appConfig.agency,
      reportName: reportConfig.name,
      scriptName: appConfig.scriptName,
    }),
  });
};

module.exports = {
  initialize,
};
