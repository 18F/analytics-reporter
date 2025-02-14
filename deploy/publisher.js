if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

if (process.env.NEW_RELIC_APP_NAME) {
  require("newrelic");
}

const logger = require("../src/logger").initialize();
logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/publisher.js");
logger.info("===================================");

// Job Scheduler
const Bree = require("bree");
const bree = new Bree({
  logger,
  jobs: [
    // Runs `../jobs/backload_api.js` immediately on process start
    {
      name: "backload_api",
      timeout: "1",
    },
  ],
});

(async () => {
  await bree.start();
})();
