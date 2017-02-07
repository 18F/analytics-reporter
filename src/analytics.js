/*
 * Workhorse module for Google Analytics interaction.
 */

var googleapis = require('googleapis'),
    fs = require('fs'),
    path = require('path');

var config = require('./config');

const buildGoogleAnalyticsQuery = require("./build-ga-query")
const fetchGoogleAnalyticsData = require("./fetch-ga-data")
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
        if (!report) {
            return callback()
        }

        const query = buildGoogleAnalyticsQuery(report)
        query.auth = jwt;
        jwt.authorize(function(err, result) {
            if (err){
                return callback(err, null)
            } else {
                fetchGoogleAnalyticsData(query, { realtime: report.realtime }).then(result => {
                    const processedData = processGoogleAnalyticsData(report, result)
                	callback(null, processedData)
                }).catch(callback)
            }
        })
    },
};

module.exports = Analytics;
