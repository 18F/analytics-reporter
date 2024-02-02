const winston = require("winston");

const logLevel = () => {
  return process.env.ANALYTICS_LOG_LEVEL || "debug"
};

// Application logger configuration
module.exports = {
  initialize: () => {
    return winston.createLogger({
      level: logLevel(),
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console({
          level: logLevel(),
        }),
      ],
    });
  }
};
