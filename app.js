// Connect to the database.
require('mongoose').connect('mongodb://localhost/analytics_db');

// Set up the cronjob.
var get_data = require('./analytics/get_analytics');
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);
var j = schedule.scheduleJob(rule, function(){
    console.log('The answer to life, the universe, and everything!');
    get_data();
});


// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);


// Attach the routes.
app.get('/', function(req, res) {res.send("Hello, world!")});
require('./routes/specific_api')(app);
require('./routes/general_api')(app);


// Boot it up!
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
