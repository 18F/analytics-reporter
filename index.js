const { AsyncLocalStorage } = require("node:async_hooks");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const util = require("util");
const AnalyticsDataProcessor = require("./src/process_results/analytics_data_processor");
const AppConfig = require("./src/app_config");
const ReportProcessingContext = require("./src/report_processing_context");
const FormatProcessedAnalyticsData = require("./src/actions/format_processed_analytics_data");
const GoogleAnalyticsService = require("./src/google_analytics/service");
const LogAnalyticsData = require("./src/actions/log_analytics_data");
const Logger = require("./src/logger");
const PostgresPublisher = require("./src/publish/postgres");
const ProcessGoogleAnalyticsResults = require("./src/actions/process_google_analytics_results");
const Processor = require("./src/processor");
const PublishAnalyticsDataToDisk = require("./src/actions/publish_analytics_data_to_disk");
const PublishAnalyticsDataToS3 = require("./src/actions/publish_analytics_data_to_s3");
const S3Service = require("./src/publish/s3");
const QueryGoogleAnalytics = require("./src/actions/query_google_analytics");
const WriteAnalyticsDataToDatabase = require("./src/actions/write_analytics_data_to_database");

/**
 * Gets an array of JSON report objects from the application confing, then runs
 * a sequential chain of actions on each report object in the array. Some of the
 * actions performed are optional based on the options passed to this function.
 *
 * @param {object} options an object with options to be used when processing
 * all reports.
 * @param {string} options.format the format of the analytics data produced.
 * Accepted formats are "csv" or "json"
 * @param {string} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {boolean} options.realtime if true, the application will use the
 * google analytics realtime data reporting API when requesting data.  Otherwise
 * the application uses the non-realtime data reporting API.
 * @param {boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {boolean} options.'write-to-database' if true, the application will
 * write the processed analytics data to the postgres database.
 * @param {string} options.only if set, runs only the report with name
 * matching the passed string.
 * @param {string} options.frequency if set, runs only the reports with
 * frequency matching the passed string.
 */
async function run(options = {}) {
  const appConfig = new AppConfig(options);
  const context = new ReportProcessingContext(new AsyncLocalStorage());
  const reportConfigs = appConfig.filteredReportConfigurations;

  for (const reportConfig of reportConfigs) {
    await _processReport(appConfig, context, reportConfig);
  }
}

/**
 * Creates a new ReportProcessingContext run for the processing of the report.
 * Adds data to the context store which can be used by all actions in the
 * processor chain (config, logger, reportConfig). Catches any errors that
 * occur during processing and logs success or failure. This method does not
 * throw so that subsequent reports will run if an error occurs in a previous
 * report.
 *
 * @param {import('./src/app_config')} appConfig the application config
 * @param {import('./src/report_processing_context')} context the
 * report-specific context for processing.
 * @param {object} reportConfig the configuration object for the analytics
 * report to process.
 * @returns {Promise} resolves when processing completes or has an error.
 */
async function _processReport(appConfig, context, reportConfig) {
  return context.run(async () => {
    const logger = Logger.initialize(appConfig, reportConfig);
    context.appConfig = appConfig;
    context.logger = logger;
    context.reportConfig = reportConfig;

    try {
      const processor = _buildProcessor(appConfig, logger);
      await processor.processChain(context);
      logger.info("Processing complete");
    } catch (e) {
      logger.error("Encountered an error");
      logger.error(util.inspect(e));
    }
  });
}

/**
 * Creates an instance of the Processor class with the actions required to
 * complete the processing of an analytics report. Actions are run sequentially
 * in the order provided to the processor here. The classes referenced here are
 * an implementation of the Chain of Responsibility design pattern.
 *
 * @param {import('./src/app_config')} appConfig an application config instance.
 * @param {import('winston').Logger} logger an application logger instance.
 * @returns {import('./src/processor')} an initialized processor instance.
 */
function _buildProcessor(appConfig, logger) {
  return new Processor([
    new QueryGoogleAnalytics(
      new GoogleAnalyticsService(
        new BetaAnalyticsDataClient(),
        appConfig,
        logger,
      ),
    ),
    new ProcessGoogleAnalyticsResults(new AnalyticsDataProcessor(appConfig)),
    new FormatProcessedAnalyticsData(),
    new WriteAnalyticsDataToDatabase(new PostgresPublisher(appConfig)),
    new PublishAnalyticsDataToS3(new S3Service(appConfig)),
    new PublishAnalyticsDataToDisk(),
    new LogAnalyticsData(),
  ]);
}

module.exports = { run };
