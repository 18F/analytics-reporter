const config = require("./src/config");
const Analytics = require("./src/analytics");
const DiskPublisher = require("./src/publish/disk");
const PostgresPublisher = require("./src/publish/postgres");
const ResultFormatter = require("./src/process-results/result-formatter");
const S3Publisher = require("./src/publish/s3");
const util = require("util");
const Logger = require("./src/logger");
const logger = Logger.initialize();

async function run(options = {}) {
  try {
    const reports = _filterReports(options);
    await _runReports(reports, options);
  } catch (e) {
    // Log errors when filtering or iterating on reports.  No execution errors
    // bubble up to the caller unless we throw here.
    logger.error(util.inspect(e));
  }
}

function _filterReports({ only, frequency }) {
  const reports = Analytics.reports;
  if (only) {
    return reports.filter((report) => report.name === only);
  } else if (frequency) {
    return reports.filter((report) => report.frequency === frequency);
  } else {
    return reports;
  }
}

async function _runReports(reports, options) {
  for (const report of reports) {
    try {
      await _runReport(report, options);
    } catch (e) {
      // Log errors when running a specific report.  Do not return the error
      // so that subsequent reports still run.
      logger.error(util.inspect(e));
    }
  }
}

async function _runReport(report, options) {
  const reportOptions = _optionsForReport(report, options);
  logger.debug(`${Logger.tag(report.name)} Fetching...`);

  try {
    const analyticsResults = await Analytics.query(report);
    logger.debug(`${Logger.tag(report.name)} Saving report data...`);
    if (config.account.agency_name) {
      analyticsResults.agency = config.account.agency_name;
    }
    const dbResults = await _writeReportToDatabase(
      report,
      analyticsResults,
      options,
    );
    const formattedResults = await ResultFormatter.formatResult(
      dbResults,
      reportOptions,
    );
    await _publishReport(report, formattedResults, reportOptions);
  } catch (e) {
    logger.error(`${Logger.tag(report.name)} encountered an error`);
    throw e;
  }
}

function _optionsForReport(report, options) {
  return {
    format: options.csv ? "csv" : "json",
    output: options.output,
    publish: options.publish,
    realtime: report.realtime,
    slim: options.slim && report.slim,
    writeToDatabase: options["write-to-database"],
  };
}

function _writeReportToDatabase(report, result, options) {
  if (options["write-to-database"] && !report.realtime) {
    return PostgresPublisher.publish(result).then(() => result);
  } else {
    return Promise.resolve(result);
  }
}

function _publishReport(report, formattedResult, options) {
  logger.debug(`${Logger.tag(report.name)} Publishing...`);
  if (options.publish) {
    return S3Publisher.publish(report, formattedResult, options);
  } else if (options.output && typeof options.output === "string") {
    return DiskPublisher.publish(report, formattedResult, options);
  } else {
    console.log(formattedResult);
  }
}

module.exports = { run };
