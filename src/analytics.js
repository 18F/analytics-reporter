const fs = require("fs")
const path = require('path')

const config = require('./config');

const authorizeGoogleAnalyticsQuery = require("./authorize-ga-query")
const buildGoogleAnalyticsQuery = require("./build-ga-query")
const fetchGoogleAnalyticsData = require("./fetch-ga-data")
const processGoogleAnalyticsData = require("./process-ga-data")

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
        authorizeGoogleAnalyticsQuery(query).then(query => {
            return fetchGoogleAnalyticsData(query, { realtime: report.realtime })
        }).then(data => {
            const processedData = processGoogleAnalyticsData(report, data)
            callback(null, processedData)
        }).catch(callback)
    },
};

module.exports = Analytics;
