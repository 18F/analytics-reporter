const winston = require("winston");

/**
 * @param {Config} config the application config
 * @param {String} reportName the name of the report currently being processed
 * @returns {String} a standard tag for the logger to identify the specific
 * report being processed when writing logs.
 */
const tag = (config, reportConfig) => {
  let tagString = "";

  if (config.scriptName) {
    tagString = tagString + `${config.scriptName} - `;
  }
  if (reportConfig.name) {
    tagString = tagString + `${reportConfig.name} - `;
  }
  if (config.agency) {
    tagString = tagString + `${config.agency}`;
  }

  return tagString;
};

module.exports = {
  /**
   * Creates an application logger instance.
   *
   * @param {Config} config application config instance. Sets the log level and
   * is also referenced to create a leading log tag for this logger instance.
   * @param {Object} reportConfig config for the report being run for this
   * logger instance. Used to create a leading log tag for messages
   * @param {String} reportConfig.name the name of the report being run for this
   * logger instance. Used to create a leading log tag for messages
   * @returns {winston.Logger} the configured logger instance
   */
  initialize: (config = { logLevel: "debug" }, reportConfig = {}) => {
    return winston.createLogger({
      level: config.logLevel,
      format: winston.format.combine(
        winston.format.label({
          label: tag(config, reportConfig),
          message: true,
        }),
        winston.format.colorize(),
        winston.format.simple(),
      ),
      transports: [
        new winston.transports.Console({
          level: config.logLevel,
        }),
      ],
    });
  },
};
