// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);

// Attach the routes.
var models = require("./models");
require('./routes')(app, models);

// Static files
var config = require('../config');
app.use(express.static(config.static.path));

//init model
var async = require("async"),
    Analytics = require("../analytics"),
    names = Object.keys(Analytics.reports);

time_mapper = {'daily': 86400000, 'hourly': 3600000, 'realtime': 10000}

var eachReport = function(name, callback) {
    var report = Analytics.reports[name];
    var doc = {
        name: name,
        update_interval: time_mapper[report.frequency],
        last_update: 0,
        query: report.query,
        realtime: report.realtime
    };
    console.log("Created endpoint: " + doc.name);
    models.data[name] = doc;
    callback();
};

async.eachSeries(names, eachReport, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("All done.");
});


// Boot it up!
var server = app.listen(app.get('port'), function () {
   console.log('Express server listening on port ' + server.address().port);
});
