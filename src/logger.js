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

// Application logger configuration
module.exports = {
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
