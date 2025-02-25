if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
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
    // Runs `../jobs/analytics.usa.gov_daily.js` 2 minute after the process starts and then at
    // 10:01 AM every day going forward.
    {
      name: "analytics.usa.gov_daily",
      timeout: "2m",
      interval: "at 10:02 am",
    },
    // Runs `../jobs/daily.js` 4 minutes after the process starts and then at
    // 6:04 AM and 10:04 AM every day going forward.
    {
      name: "daily",
      timeout: "4m",
      interval: "at 6:04 am also at 10:04 am",
    },
    // Runs `../jobs/api.js` 6 minutes after the process starts and then at
    // 10:06 AM every day going forward.
    {
      name: "api",
      timeout: "6m",
      interval: "at 10:06 am",
    },
  ],
});

(async () => {
  await bree.start();
})();
