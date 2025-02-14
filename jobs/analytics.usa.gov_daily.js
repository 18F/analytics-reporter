process.env.ANALYTICS_REPORTS_PATH = "reports/analytics.usa.gov.json";
process.env.ANALYTICS_SCRIPT_NAME = "analytics.usa.gov_daily.js";

const { runQueuePublish } = require("../index.js");
const options = {
  publish: true,
  frequency: "daily",
  debug: true,
  csv: true,
  json: true,
  agenciesFile: `${process.env.ANALYTICS_ROOT_PATH}/deploy/analytics.usa.gov_property.json`,
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
