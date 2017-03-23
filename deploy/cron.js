const winston = require("winston-color")

if (process.env.NEW_RELIC_APP_NAME) {
	winston.info("Starting New Relic")
	require("newrelic")
} else {
	winston.warn("Skipping New Relic Activation")
}

const spawn = require("child_process").exec;
const execSync = require("child_process").execSync;

var daily_run = function() {
	winston.info("about to run daily.sh");

	var daily = spawn("./deploy/daily.sh")
	daily.stdout.on("data", (data) => {
		winston.info("[daily.sh]", data)
	})
	daily.stderr.on("data", (data) => {
		winston.info("[daily.sh]", data)
	})
	daily.on("exit", (code) => {
		winston.info("daily.sh exitted with code:", code)
	})
}

var hourly_run = function(){
	winston.info("about to run hourly.sh");

	var hourly = spawn("./deploy/hourly.sh")
	hourly.stdout.on("data", (data) => {
		winston.info("[hourly.sh]", data)
	})
	hourly.stderr.on("data", (data) => {
		winston.info("[hourly.sh]", data)
	})
	hourly.on("exit", (code) => {
		winston.info("hourly.sh exitted with code:", code)
	})
}

var realtime_run = function(){
	winston.info("about to run realtime.sh");

	var realtime = spawn("./deploy/realtime.sh")
	realtime.stdout.on("data", (data) => {
		winston.info("[realtime.sh]", data)
	})
	realtime.stderr.on("data", (data) => {
		winston.info("[realtime.sh]", data)
	})
	realtime.on("exit", (code) => {
		winston.info("realtime.sh exitted with code:", code)
	})
}


winston.info("starting cron.js!");
daily_run();
hourly_run();
realtime_run();
//daily
const currentTime = new Date();
const nextRunTime = new Date(
	currentTime.getFullYear(),
	currentTime.getMonth(),
	currentTime.getDate() + 1,
	10 - currentTime.getTimezoneOffset() / 60
);
setInterval(() => {
	daily_run();
	setInterval(daily_run, 1000 * 60 * 60 * 24);
}, nextRunTime - currentTime);
//hourly
setInterval(hourly_run,1000 * 60 * 60);
//realtime
setInterval(realtime_run,1000 * 60 * 5);
