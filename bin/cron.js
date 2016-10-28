var analytics = require("./analytics.js");

setInterval(function(){

    var options = {};
    options.publish = true;
    options.debug= true;
    analytics.run(options);
//run once a day
}, 1000 * 60 * 60 * 24);

setInterval(function(){

var options = {};
    options.publish = true;
    options.debug=true;
    analytics.run(options);
//run once an hour
}, 1000 * 60 * 60);

setInterval(function(){

var options = {};
    options.publish = true;
    options.debug=true;
    analytics.run(options);
//run everything 3 minutes
}, 1000 * 60 * 3);

var options = {};
options.publish=true;
options.debug=true;
analytics.run(options);
