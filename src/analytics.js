/*
 * Workhorse module for Google Analytics interaction.
 */

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var config = require('./config');
const buildGoogleAnalyticsQuery = require("./build-ga-query")
const processGoogleAnalyticsData = require("./process-ga-data")

// Pre-load the keyfile from the OS
// prevents errors when starting JWT
var key;
if (config.key)
    key = config.key;
else if (config.key_file && fs.existsSync(config.key_file)) {
    key = fs.readFileSync(config.key_file);
    if (config.key_file.search(".json$"))
        key = JSON.parse(key).private_key;
}
else
  key = null;

var jwt = new googleapis.auth.JWT(
    config.email,
    null,
    key,
    ['https://www.googleapis.com/auth/analytics.readonly']
);

// The reports we want to run.
var reports_path = config.reports_file || (path.join(process.cwd(), "reports/reports.json"));
var reports = JSON.parse(fs.readFileSync(reports_path)).reports;
var by_name = {};
for (var i=0; i<reports.length; i++)
    by_name[reports[i].name] = reports[i];

// Google Analytics data fetching and transformation utilities.
// This should really move to its own analytics.js file.
var Analytics = {

    reports: by_name,

    query: function(report, callback) {

        // Abort if the report isn't defined.
        if (!report) return callback();

        var query = buildGoogleAnalyticsQuery(report)
        query.auth = jwt;

        var api_call;
        if (report.realtime)
            api_call = ga.data.realtime.get;
        else
            api_call = ga.data.ga.get;

        jwt.authorize(function(err, result) {
            if (err) return callback(err, null);

            api_call(query, function(err, result) {
                if (err) return callback(err, null);

                // if (config.debug)
                //     fs.writeFileSync("data/google/" + report.name + ".json", JSON.stringify(result, null, 2));

                callback(null, processGoogleAnalyticsData(report, result));
            });
        });
    },
};

module.exports = Analytics;
