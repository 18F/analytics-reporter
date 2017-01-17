const exec = require("child_process").exec;
const execSync = require("child_process").execSync;

var daily_run = function(){
	console.log("about to run daily.sh");
	exec("./deploy/daily.sh > ../logs/daily.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in daily.log:");
		console.log(execSync("wc -l ../logs/daily.log").toString());
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
}

var hourly_run = function(){
	console.log("about to run hourly.sh");
	exec("./deploy/hourly.sh > ../logs/hourly.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in hourly.log:");
		console.log(execSync("wc -l ../logs/hourly.log").toString());
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
}

var realtime_run = function(){
	console.log("realtime.sh is about to run");
	exec("./deploy/realtime.sh > ../logs/realtime.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in realtime.log:");
		console.log(execSync("wc -l ../logs/realtime.log").toString());
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
}


console.log("starting cron.js!");
daily_run();
hourly_run();
realtime_run();
//daily
setInterval(daily_run,1000 * 60 * 60 * 24);
//hourly
setInterval(hourly_run,1000 * 60 * 60);
//realtime
setInterval(realtime_run,1000 * 60 * 10);
