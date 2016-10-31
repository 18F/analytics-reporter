const exec = require("child_process").exec;

var daily_run = function(){
	exec("./daily.sh > ../logs/daily.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.log(`${stdout}`);
			console.log(`stderr: ${stderr}`); 
			console.error(`exec error: ${error}`);
			return;
		}
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`); 
	});
}

var hourly_run = function(){
	exec("./hourly.sh > ../logs/hourly.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`); 
	});	
}

var realtime_run = function(){
	exec("./realtime.sh > ../logs/realtime.log 2>&1", (error,stdout,stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			return;
		}
		console.log(`${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
}

daily_run();
hourly_run();
realtime_run();
/*
//daily
setInterval(daily_run,1000 * 60 * 60 * 24);
//hourly
setInterval(hourly_run,1000 * 60 * 60);
//realtime
setInterval(realtime_run,1000 * 60 * 10);
*/