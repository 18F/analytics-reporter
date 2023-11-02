const spawn = require("child_process").spawn;
const winston = require("winston")

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
  });
if (process.env.NEW_RELIC_APP_NAME) {
	logger.info("Starting New Relic")
	require("newrelic")
} else {
	logger.warn("Skipping New Relic Activation")
}

const scriptRootPath = `${process.env.ANALYTICS_ROOT_PATH}/deploy`

var api_run = function() {
	logger.info("about to run api.sh");

	var api = spawn(`${scriptRootPath}/api.sh`)
	api.stdout.on("data", (data) => {
		logger.info("[api.sh]", data.toString().trim())
	})
	api.stderr.on("data", (data) => {
		logger.info("[api.sh]", data.toString().trim())
	})
	api.on("exit", (code) => {
		logger.info("api.sh exitted with code:", code)
	})
}

var daily_run = function() {
	logger.info("about to run daily.sh");

	var daily = spawn(`${scriptRootPath}/daily.sh`)
	daily.stdout.on("data", (data) => {
		logger.info("[daily.sh]", data.toString().trim())
	})
	daily.stderr.on("data", (data) => {
		logger.info("[daily.sh]", data.toString().trim())
	})
	daily.on("exit", (code) => {
		logger.info("daily.sh exitted with code:", code)
	})
}

var hourly_run = function(){
	logger.info("about to run hourly.sh");

	var hourly = spawn(`${scriptRootPath}/hourly.sh`)
	hourly.stdout.on("data", (data) => {
		logger.info("[hourly.sh]", data.toString().trim())
	})
	hourly.stderr.on("data", (data) => {
		logger.info("[hourly.sh]", data.toString().trim())
	})
	hourly.on("exit", (code) => {
		logger.info("hourly.sh exitted with code:", code)
	})
}

var realtime_run = function(){
	logger.info("about to run realtime.sh");

	var realtime = spawn(`${scriptRootPath}/realtime.sh`)
	realtime.stdout.on("data", (data) => {
		logger.info("[realtime.sh]", data.toString().trim())
	})
	realtime.stderr.on("data", (data) => {
		logger.info("[realtime.sh]", data.toString().trim())
	})
	realtime.on("exit", (code) => {
		logger.info("realtime.sh exitted with code:", code)
	})
}

/**
	Daily reports run every morning at 10 AM UTC.
	This calculates the offset between now and then for the next scheduled run.
*/
var calculateNextDailyRunTimeOffset = function(){
	const currentTime = new Date();
	const nextRunTime = new Date(
		currentTime.getFullYear(),
		currentTime.getMonth(),
		currentTime.getDate() + 1,
		10 - currentTime.getTimezoneOffset() / 60
	);
	return (nextRunTime - currentTime) % (1000 * 60 * 60 * 24)
}

logger.info("starting cron.js!");
api_run();
daily_run();
hourly_run();
realtime_run();
//api
setInterval(api_run,1000 * 60 * 60 * 24)
//daily
setTimeout(() => {
	// Run at 10 AM UTC, then every 24 hours afterwards
	daily_run();
	setInterval(daily_run, 1000 * 60 * 60 * 24);
}, calculateNextDailyRunTimeOffset());
//hourly
setInterval(hourly_run,1000 * 60 * 60);
//realtime
setInterval(realtime_run,1000 * 60 * 5);
