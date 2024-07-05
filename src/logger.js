const winston = require("winston");

/**
 * @param {AppConfig} appConfig the application config
 * @param {String} reportName the name of the report currently being processed
 * @returns {String} a standard tag for the logger to identify the specific
 * report being processed when writing logs.
 */
const tag = (appConfig, reportConfig) => {
  let tagString = "";

  if (appConfig.scriptName) {
    tagString = tagString + `${appConfig.scriptName} - `;
  }
  if (reportConfig.name) {
    tagString = tagString + `${reportConfig.name} - `;
  }
  if (appConfig.agency) {
    tagString = tagString + `${appConfig.agency}`;
  }

  return tagString;
};

module.exports = {
  /**
   * Creates an application logger instance.
   *
   * @param {AppConfig} appConfig application config instance. Sets the log level and
   * is also referenced to create a leading log tag for this logger instance.
   * @param {Object} reportConfig config for the report being run for this
   * logger instance. Used to create a leading log tag for messages
   * @param {String} reportConfig.name the name of the report being run for this
   * logger instance. Used to create a leading log tag for messages
   * @returns {winston.Logger} the configured logger instance
   */
  initialize: (appConfig = { logLevel: "debug" }, reportConfig = {}) => {
    return winston.createLogger({
      level: appConfig.logLevel,
      format: winston.format.combine(
        winston.format.label({
          label: tag(appConfig, reportConfig),
          message: true,
        }),
        winston.format.colorize(),
        winston.format.simple(),
      ),
      transports: [
        new winston.transports.Console({
          level: appConfig.logLevel,
        }),
      ],
    });
  },
};
