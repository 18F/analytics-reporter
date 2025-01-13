process.env.ANALYTICS_REPORTS_PATH = "reports/api.json";
process.env.ANALYTICS_SCRIPT_NAME = "api.js";

const { runQueuePublish } = require("../index.js");
const options = {
  frequency: "daily",
  debug: true,
  "write-to-database": true,
  agenciesFile: `${process.env.ANALYTICS_ROOT_PATH}/deploy/agencies.json`,
};
const logger = require("../src/logger.js").initialize();

(async () => {
  logger.info(`Beginning job: ${process.env.ANALYTICS_SCRIPT_NAME}`);

  try {
    await runQueuePublish(options);
    logger.info(`Job completed: ${process.env.ANALYTICS_SCRIPT_NAME}`);
  } catch (e) {
    logger.error(`Job exited with error: ${process.env.ANALYTICS_SCRIPT_NAME}`);
    logger.error(e);
    throw e;
  }
})();
