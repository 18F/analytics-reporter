// Connect to the database.
var mongo = require("./config").mongo;
require('mongoose').connect('mongodb://' + mongo.host + '/' + mongo.database);

//initalize database
var fs = require('fs'),
    models = require('./models');
fs.readFile('analytics_urls.txt', function(err, data) {
    if(err) throw err;
    var array = data.toString().split("\n");
    for(i in array) {
        element = array[i].split("|");
        console.log(element)
        var general = new models.General(
            {slug: element[0], apicall: element[1]})
        general.save()
    }
});


// Set up the cronjob.
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 10);
schedule.scheduleJob(rule, require("./data"));


// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);


// Attach the routes.
var models = require("./models");
app.get('/', function(req, res) {res.send("Hello, world!")});
require('./routes')(app, models);


// Boot it up!
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
