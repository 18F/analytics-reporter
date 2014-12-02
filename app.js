// Connect to the database.
require('mongoose').connect('mongodb://localhost/analytics_db');

// Set up the cronjob.
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);
schedule.scheduleJob(rule, require("./data"));


// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);


// Attach the routes.
app.get('/', function(req, res) {res.send("Hello, world!")});
require('./routes')(app);


// Boot it up!
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
