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
    // Runs `../jobs/realtime.js` 1 millisecond after the process starts and
    // then every 15 minutes going forward.
    {
      name: "realtime",
      timeout: "1",
      interval: "15m",
    },
    // Runs `../jobs/daily.js` 1 minute after the process starts and then at
    // 10:01 AM every day going forward.
    {
      name: "daily",
      timeout: "1m",
      interval: "at 10:01 am",
    },
    // Runs `../jobs/api.js` 2 minutes after the process starts and then at
    // 10:02 AM every day going forward.
    {
      name: "api",
      timeout: "2m",
      interval: "at 10:02 am",
    },
  ],
});

(async () => {
  await bree.start();
})();
