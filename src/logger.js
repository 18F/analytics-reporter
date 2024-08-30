const winston = require("winston");

/**
 * @param {object} params the parameter object
 * @param {string} params.agencyName the agency name to use for log tagging.
 * @param {string} params.reportName the report name to use for log tagging.
 * @param {string} params.scriptName the script name to use for log tagging.
 * @returns {string} a standard tag for the logger to identify the specific
 * agency, report, and script being processed when writing logs.
 */
const tag = ({ agencyName, reportName, scriptName }) => {
  let tagString = "";

  if (scriptName) {
    tagString = tagString + `${scriptName}`;
  }
  if (reportName) {
    tagString = tagString + `${tagString ? " - " : ""}${reportName}`;
  }
  if (agencyName) {
    tagString = tagString + `${tagString ? " - " : ""}${agencyName}`;
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
 * @param {object} params the parameter object
 * @param {string} params.agencyName the agency name to use for log tagging.
 * @param {string} params.reportName the report name to use for log tagging.
 * @param {string} params.scriptName the script name to use for log tagging.
 * @returns {import('winston').Logger} the configured logger instance
 */
const initialize = ({
  agencyName = "",
  reportName = "",
  scriptName = "",
} = {}) => {
  return baseLogger.child({
    label: tag({ agencyName, reportName, scriptName }),
  });
};

module.exports = {
  initialize,
};
