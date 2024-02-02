const config = require("./src/config")
const Analytics = require("./src/analytics")
const DiskPublisher = require("./src/publish/disk")
const PostgresPublisher = require("./src/publish/postgres")
const ResultFormatter = require("./src/process-results/result-formatter")
const S3Publisher = require("./src/publish/s3")
const logger = require('./src/logger').initialize();

Promise.each = async function (arr, fn) {
  for (const item of arr) await fn(item);
}

const run = function (options = {}) {
  const reports = _filterReports(options)
  return Promise.each(reports, report => _runReport(report, options))
}

const _filterReports = ({ only, frequency }) => {
  const reports = Analytics.reports
  if (only) {
    return reports.filter(report => report.name === only)
  } else if (frequency) {
    return reports.filter(report => report.frequency === frequency)
  } else {
    return reports
  }
}

const _optionsForReport = (report, options) => ({
  format: options.csv ? "csv" : "json",
  output: options.output,
  publish: options.publish,
  realtime: report.realtime,
  slim: options.slim && report.slim,
  writeToDatabase: options["write-to-database"],
})

const _publishReport = (report, formattedResult, options) => {
  logger.debug(`[${report.name}]`, "Publishing...")
  if (options.publish) {
    return S3Publisher.publish(report, formattedResult, options)
  } else if (options.output && typeof (options.output) === "string") {
    return DiskPublisher.publish(report, formattedResult, options)
  } else {
    console.log(formattedResult)
  }
}

const _runReport = (report, options) => {
  const reportOptions = _optionsForReport(report, options)
  logger.debug("[" + report.name + "] Fetching...");

  return Analytics.query(report).then(results => {
    logger.debug("[" + report.name + "] Saving report data...")
    if (config.account.agency_name) {
      results.agency = config.account.agency_name
    }
    return _writeReportToDatabase(report, results, options)
  }).then(results => {
    return ResultFormatter.formatResult(results, reportOptions)
  }).then(formattedResult => {
    return _publishReport(report, formattedResult, reportOptions)
  }).catch(err => {
    logger.error(`[${report.name}] `, err)
  })
}

const _writeReportToDatabase = (report, result, options) => {
  if (options["write-to-database"] && !report.realtime) {
    return PostgresPublisher.publish(result).then(() => result)
  } else {
    return Promise.resolve(result)
  }
}

module.exports = { run };
