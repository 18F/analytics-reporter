const fs = require("fs")
const path = require('path')

const config = require('./config');

const GoogleAnalyticsClient = require("./google-analytics/client")
const GoogleAnalyticsDataProcessor = require("./process-results/ga-data-processor")

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

  query: function(report) {
    if (!report) {
      return Promise.reject("Analytics.query missing required argument `report`")
    }

    return GoogleAnalyticsClient.fetchData(report).then(data => {
      return GoogleAnalyticsDataProcessor.processData(report, data)
    })
  },
};

module.exports = Analytics;
