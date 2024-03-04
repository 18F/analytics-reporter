const winston = require("winston");

const logLevel = () => {
  return process.env.ANALYTICS_LOG_LEVEL || "debug";
};

// Application logger configuration
module.exports = {
  initialize: () => {
    return winston.createLogger({
      level: logLevel(),
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
      transports: [
        new winston.transports.Console({
          level: logLevel(),
        }),
      ],
    });
  },
  /**
   * @param {String} reportName the name of the report currently being processed
   * @returns {String} a standard tag for the logger to identify the specific
   * report being processed when writing logs.
   */
  tag: (reportName) => {
    return `[${reportName}: ${process.env.AGENCY_NAME || "gov-wide"}]`;
  },
};
