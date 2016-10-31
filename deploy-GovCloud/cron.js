const exec = require("child_process").exec;

var daily_run = function(){
	console.log("about to run daily.sh");
	exec("./daily.sh > ../logs/daily.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in daily.log:");
		execSync("wc -l daily.log");
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`); 
	});
}

var hourly_run = function(){
	console.log("about to run hourly.sh");
	exec("./hourly.sh > ../logs/hourly.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in hourly.log:");
		execSync("wc -l hourly.log");
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`); 
	});	
}

var realtime_run = function(){
	console.log("realtime.sh is about to run");
	exec("./realtime.sh > ../logs/realtime.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log("number of lines in realtime.log:");
		execSync("wc -l realtime.log");
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