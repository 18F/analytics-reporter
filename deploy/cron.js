if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

if (process.env.NEW_RELIC_APP_NAME) {
  require("newrelic");
}

const spawn = require("child_process").spawn;
const logger = require("../src/logger").initialize();

logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/cron.js");
logger.info("===================================");

const scriptRootPath = `${process.env.ANALYTICS_ROOT_PATH}/deploy`;
const scriptUARootPath = `${process.env.ANALYTICS_UA_ROOT_PATH}/deploy`;

const runScriptWithLogName = (scriptPath, scriptLoggingName) => {
  logger.info(`Beginning: ${scriptLoggingName}`);
  logger.info(`File path: ${scriptPath}`);
  const childProcess = spawn(scriptPath);

  childProcess.stdout.on("data", (data) => {
    // Writes logging output from child processes to console.
    console.log(data.toString().trim());
  });

  childProcess.stderr.on("data", (data) => {
    // Writes error logging output from child processes to console.
    console.log(data.toString().trim());
  });

  childProcess.on("close", (code, signal) => {
    logger.info(`${scriptLoggingName} exitted with code: ${code}`);
    if (signal) {
      logger.info(`${scriptLoggingName} received signal: ${signal}`);
    }
  });
};

const api_ua_run = () => {
  runScriptWithLogName(`${scriptUARootPath}/api.sh`, "ua - api.sh");
};

const api_run = () => {
  runScriptWithLogName(`${scriptRootPath}/api.sh`, "api.sh");
};

const daily_run = () => {
  runScriptWithLogName(`${scriptRootPath}/daily.sh`, "daily.sh");
};

const hourly_run = () => {
  runScriptWithLogName(`${scriptRootPath}/hourly.sh`, "hourly.sh");
};

const realtime_run = () => {
  runScriptWithLogName(`${scriptRootPath}/realtime.sh`, "realtime.sh");
};

/**
  Daily reports run every morning at 10 AM UTC.
  This calculates the offset between now and then for the next scheduled run.
*/
const calculateNextDailyRunTimeOffset = () => {
  const currentTime = new Date();
  const nextRunTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate() + 1,
    10 - currentTime.getTimezoneOffset() / 60,
  );
  return (nextRunTime - currentTime) % (1000 * 60 * 60 * 24);
};

/**
 * All scripts run immediately upon application start, then run again at
 * intervals going forward.
 */
api_run();
api_ua_run();
daily_run();
hourly_run();
realtime_run();

// daily
// Runs at 10 AM UTC, then every 24 hours afterwards
setTimeout(() => {
  daily_run();
  setInterval(daily_run, 1000 * 60 * 60 * 24);
  // API
  api_run();
  setInterval(api_run, 1000 * 60 * 60 * 24);
  // UA API
  api_ua_run();
  setInterval(api_ua_run, 1000 * 60 * 60 * 24);
}, calculateNextDailyRunTimeOffset());
// hourly
setInterval(hourly_run, 1000 * 60 * 60);
// realtime. Runs every 15 minutes.
// Google updates realtime reports every 30 minutes, so there is some overlap.
setInterval(realtime_run, 1000 * 60 * 15);
