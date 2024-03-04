const { AsyncLocalStorage } = require("node:async_hooks");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const util = require("util");
const AnalyticsDataProcessor = require("./src/process-results/analytics-data-processor");
const Config = require("./src/config");
const FormatProcessedAnalyticsData = require("./src/actions/format_processed_analytics_data");
const GoogleAnalyticsQueryAuthorizer = require("./src/google-analytics/query-authorizer");
const GoogleAnalyticsService = require("./src/google-analytics/service");
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
 * Gets an array of JSON report objects, then runs a sequential chain of actions
 * on each report object in the array. The some of the actions performed are
 * optional based on the options passed to this function.
 *
 * @param {Object} options an object with options to be used when processing
 * all reports.
 * @param {String} options.format the format of the analytics data produced.
 * Accepted formats are "csv" or "json"
 * @param {String} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {Boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {Boolean} options.realtime if true, the application will use the
 * google analytics realtime data API when requesting data.
 * @param {Boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {Boolean} options['write-to-database'] if true, the application will
 * write the processed analytics data to the postgres database.
 */
async function run(options = {}) {
  const config = new Config(options);
  const context = new AsyncLocalStorage();
  const reportConfigs = config.filteredReportConfigurations;

  for (const reportConfig of reportConfigs) {
    await _processReport(config, context, reportConfig);
  }
}

async function _processReport(config, context, reportConfig) {
  const store = new Map();
  return context.run(store, async () => {
    const logger = Logger.initialize();
    store.set("config", config);
    store.set("logger", logger);
    store.set("reportConfig", reportConfig);

    try {
      const processor = _buildProcessor(config);
      await processor.processChain(context);
      logger.info(`${Logger.tag(reportConfig.name)} processing complete`);
    } catch (e) {
      logger.error(`${Logger.tag(reportConfig.name)} encountered an error`);
      logger.error(util.inspect(e));
    }
  });
}

function _buildProcessor(config) {
  return new Processor([
    new QueryGoogleAnalytics(
      new GoogleAnalyticsService(
        new BetaAnalyticsDataClient(),
        new GoogleAnalyticsQueryAuthorizer(config),
      ),
    ),
    new ProcessGoogleAnalyticsResults(new AnalyticsDataProcessor(config)),
    new FormatProcessedAnalyticsData(),
    new WriteAnalyticsDataToDatabase(new PostgresPublisher(config)),
    new PublishAnalyticsDataToS3(new S3Service(config)),
    new PublishAnalyticsDataToDisk(),
    new LogAnalyticsData(),
  ]);
}

module.exports = { run };
