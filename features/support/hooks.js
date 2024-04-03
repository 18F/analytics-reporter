const { Before, After } = require("@cucumber/cucumber");
const fs = require("fs");

// Set the output directory for reports written to disk and create the directory
Before(function () {
  this.outputDir = "./output";
  fs.mkdirSync(this.outputDir);
});

// Set the env vars for GA4 retries to low enough that the scenario will not
// timeout if retries occur
Before(function () {
  process.env.ANALYTICS_GA4_CALL_RETRY_COUNT = 3;
  process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS = 300;
});

// Set the log level to error to avoid spam in the cucumber output
Before(function () {
  process.env.ANALYTICS_LOG_LEVEL = "error";
});

// Clear and delete the output directory for reports after each scenario.
After(function () {
  fs.rmdirSync(this.outputDir, { recursive: true });
});
