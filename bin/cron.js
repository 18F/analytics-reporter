var analytics = require("./analytics.js");

setInterval(function(){

var options = {};
options.output = "/Users/ericschles/Documents/projects/analytics-reporter/reports/";
analytics.run(output)
//run once a day
}, 1000 * 60 * 60 * 24);

setInterval(function(){

var options = {};
options.output = "/Users/ericschles/Documents/projects/analytics-reporter/reports/";
analytics.run(output)
//run once an hour
}, 1000 * 60 * 60);

setInterval(function(){

var options = {};
options.output = "/Users/ericschles/Documents/projects/analytics-reporter/reports/";
analytics.run(output)
//run everything 3 minutes
}, 1000 * 60 * 3);