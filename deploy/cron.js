if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

if (process.env.NEW_RELIC_APP_NAME) {
  require("newrelic");
}

const maxListenersExceededWarning = require("max-listeners-exceeded-warning");
maxListenersExceededWarning();

const spawn = require("child_process").spawn;
const logger = require("../src/logger").initialize();

logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/cron.js");
logger.info("===================================");

const scriptRootPath = `${process.env.ANALYTICS_ROOT_PATH}/deploy`;

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
    logger.info(`${scriptLoggingName} closed with code: ${code}`);
    if (signal) {
      logger.info(`${scriptLoggingName} received signal: ${signal}`);
    }
  });

  childProcess.on("exit", (code, signal) => {
    logger.info(`${scriptLoggingName} exitted with code: ${code}`);
    if (signal) {
      logger.info(`${scriptLoggingName} received signal: ${signal}`);
    }
  });

  childProcess.on("error", (err) => {
    logger.info(`${scriptLoggingName} errored: ${err}`);
  });
};

const api_run = () => {
  runScriptWithLogName(`${scriptRootPath}/api.sh`, "api.sh");
};

const daily_run = () => {
  runScriptWithLogName(`${scriptRootPath}/daily.sh`, "daily.sh");
};

/*const hourly_run = () => {
  runScriptWithLogName(`${scriptRootPath}/hourly.sh`, "hourly.sh");
};*/

const realtime_run = () => {
  runScriptWithLogName(`${scriptRootPath}/realtime.sh`, "realtime.sh");
};

/**
 * Daily and API reports run every morning at 10 AM UTC.
 * This calculates the offset between now and then for the next scheduled run.
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
 * All scripts run immediately upon application start (with a 60 second delay
 * between each so that they don't all run at once), then run again at intervals
 * going forward.
 */
setTimeout(realtime_run, 1000 * 10);
// setTimeout(hourly_run, 1000 * 70); No hourly reports exist at this time.
setTimeout(daily_run, 1000 * 70);
setTimeout(api_run, 1000 * 130);

// Daily and API recurring script run setup.
// Runs at 10 AM UTC, then every 24 hours afterwards
setTimeout(() => {
  // Offset the daily script run by 30 seconds so that it never runs in parallel
  // with the realtime script in order to save memory/CPU.
  setTimeout(() => {
    daily_run();
    setInterval(daily_run, 1000 * 60 * 60 * 24);
  }, 1000 * 30);

  // setTimeout(hourly_run, 1000 * 60);

  // Offset the API script run by 90 seconds so that it never runs in parallel
  // with the daily or realtime scripts in order to save memory/CPU.
  setTimeout(() => {
    api_run();
    setInterval(api_run, 1000 * 60 * 60 * 24);
  }, 1000 * 90);
}, calculateNextDailyRunTimeOffset());
// hourly (no hourly reports exist at this time).
// setInterval(hourly_run, 1000 * 60 * 60);

// Realtime recurring script run setup. Runs every 15 minutes.
setInterval(realtime_run, 1000 * 60 * 15);
