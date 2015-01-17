// Connect to the database.
var mongo = require("../config").mongo;
require('mongoose').connect('mongodb://' + mongo.host + '/' + mongo.database);

// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);


// Attach the routes.
var models = require("./models");
app.get('/', function (req, res) {
    res.send("Hello, world!");
});
require('./routes')(app, models);


//init model
var async = require("async"),
    Analytics = require("../analytics"),
    names = Object.keys(Analytics.reports);

time_mapper = {'daily': 86400000, 'hourly': 3600000, 'realtime': 10000}

var eachReport = function(name, callback) {
    var report = Analytics.reports[name];
        var doc = new models.Analytics({
            name: name,
            update_interval: time_mapper[report.frequency],
            last_update: 0,
            query: report.query
        });
    doc.save();
    console.log("Created endpoint: " + doc.name);
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
