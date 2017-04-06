const path = require("path")
const config = require('./config')
const GoogleAnalyticsClient = require("./google-analytics/client")
const GoogleAnalyticsDataProcessor = require("./process-results/ga-data-processor")

const query = (report) => {
  if (!report) {
    return Promise.reject(new Error("Analytics.query missing required argument `report`"))
  }

  return GoogleAnalyticsClient.fetchData(report).then(data => {
    return GoogleAnalyticsDataProcessor.processData(report, data)
  })
}

const _loadReports = () => {
  const _reportFilePath = path.resolve(process.cwd(), config.reports_file || "reports/reports.json")
  return require(_reportFilePath).reports
}

module.exports = {
  query,
  reports: _loadReports(),
}
