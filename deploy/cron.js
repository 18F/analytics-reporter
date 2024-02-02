if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

if (process.env.NEW_RELIC_APP_NAME) {
  require("newrelic");
}

const spawn = require("child_process").spawn;
const winston = require("winston");

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: "debug",
    }),
  ],
});

logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/cron.js");
logger.info("===================================");

const scriptRootPath = `${process.env.ANALYTICS_ROOT_PATH}/deploy`;
const scriptUARootPath = `${process.env.ANALYTICS_UA_ROOT_PATH}/deploy`;

const handlStderrData = (data) => {
  try {
    const jsonData = JSON.parse(data.toString());
    // Handle the parsed JSON data here
    jsonData.level === "error"
      ? logger.error(jsonData.message)
      : logger.info(jsonData);
  } catch (error) {
    logger.error(data.toString().trim());
  }
  return;
};

var api_ua_run = function () {
  logger.info("about to run ua api.sh");
  logger.info(`${scriptUARootPath}/api.sh`);
  var api = spawn(`${scriptUARootPath}/api.sh`);

  api.stdout.on("data", (data) => {
    logger.info("[ua - api.sh]");
    handlStderrData(data);
  });

  api.stderr.on("data", (data) => {
    logger.info("[ua - api.sh]");
    handlStderrData(data);
  });

  api.on("exit", (code) => {
    logger.info("ua - api.sh exitted with code:", code);
  });
};

var api_run = function () {
  logger.info("about to run api.sh");

  var api = spawn(`${scriptRootPath}/api.sh`);
  api.stdout.on("data", (data) => {
    logger.info("[api.sh]");
    handlStderrData(data);
  });
  api.stderr.on("data", (data) => {
    logger.info("[api.sh]");
    handlStderrData(data);
  });
  api.on("exit", (code) => {
    logger.info("api.sh exitted with code:", code);
  });
};

var daily_run = function () {
  logger.info("about to run daily.sh");

  var daily = spawn(`${scriptRootPath}/daily.sh`);
  daily.stdout.on("data", (data) => {
    logger.info("[daily.sh]");
    handlStderrData(data);
  });
  daily.stderr.on("data", (data) => {
    logger.info("[daily.sh]");
    handlStderrData(data);
  });
  daily.on("exit", (code) => {
    logger.info("daily.sh exitted with code:", code);
  });
};

var hourly_run = function () {
  logger.info("about to run hourly.sh");

  var hourly = spawn(`${scriptRootPath}/hourly.sh`);
  hourly.stdout.on("data", (data) => {
    logger.info("[hourly.sh]");
    handlStderrData(data);
  });
  hourly.stderr.on("data", (data) => {
    logger.info("[hourly.sh]");
    handlStderrData(data);
  });
  hourly.on("exit", (code) => {
    logger.info("hourly.sh exitted with code:", code);
  });
};

var realtime_run = function () {
  logger.info("about to run realtime.sh");

  var realtime = spawn(`${scriptRootPath}/realtime.sh`);
  realtime.stdout.on("data", (data) => {
    logger.info("[realtime.sh]");
    handlStderrData(data);
  });
  realtime.stderr.on("data", (data) => {
    logger.info("[realtime.sh]");
    handlStderrData(data);
  });
  realtime.on("exit", (code) => {
    logger.info("realtime.sh exitted with code:", code);
  });
};

/**
	Daily reports run every morning at 10 AM UTC.
	This calculates the offset between now and then for the next scheduled run.
*/
var calculateNextDailyRunTimeOffset = function () {
  const currentTime = new Date();
  const nextRunTime = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate() + 1,
    10 - currentTime.getTimezoneOffset() / 60
  );
  return (nextRunTime - currentTime) % (1000 * 60 * 60 * 24);
};

logger.info("starting cron.js!");
api_run();
api_ua_run();
daily_run();
hourly_run();
realtime_run();
// daily
setTimeout(() => {
  // Run at 10 AM UTC, then every 24 hours afterwards
  daily_run();
  setInterval(daily_run, 1000 * 60 * 60 * 24);
  //api
  api_run();
  setInterval(api_run, 1000 * 60 * 60 * 24);
  //ua api
  api_ua_run();
  setInterval(api_ua_run, 1000 * 60 * 60 * 24);
}, calculateNextDailyRunTimeOffset());
//hourly
setInterval(hourly_run, 1000 * 60 * 60);
//realtime
setInterval(realtime_run, 1000 * 60 * 5);
