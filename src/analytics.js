/*
 * Workhorse module for Google Analytics interaction.
 */

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var config = require('./config');
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

        // Insert IDs and auth data. Dupe the object so it doesn't
        // modify the report object for later work.
        var query = {};

        if (report.query.dimensions)
            query.dimensions = report.query.dimensions.join(",");

        if (report.query.metrics)
            query.metrics = report.query.metrics.join(",");

        if (report.query['start-date'])
            query["start-date"] = report.query['start-date'];
        if (report.query['end-date'])
            query["end-date"] = report.query['end-date'];

        // never sample data - this should be fine
        query['samplingLevel'] = "HIGHER_PRECISION";

        // Optional filters.
        var filters = [];
        if (report.query.filters)
            filters = filters.concat(report.query.filters);

        if (report.filters)
            filters = filters.concat(report.filters);

        if (filters.length > 0)
            query.filters = filters.join(";");

        query['max-results'] = report.query['max-results'] || 10000;

        if (report.query['sort'])
            query['sort'] = report.query['sort'];


        // Specify the account, and auth token.
        query.ids = config.account.ids;
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
