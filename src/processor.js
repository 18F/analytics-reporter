const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const AnalyticsDataProcessor = require("../src/process_results/analytics_data_processor");
const FormatProcessedAnalyticsData = require("../src/actions/format_processed_analytics_data");
const GoogleAnalyticsService = require("../src/google_analytics/service");
const LogAnalyticsData = require("../src/actions/log_analytics_data");
const PostgresPublisher = require("../src/publish/postgres");
const ProcessGoogleAnalyticsResults = require("../src/actions/process_google_analytics_results");
const PublishAnalyticsDataToDisk = require("../src/actions/publish_analytics_data_to_disk");
const PublishAnalyticsDataToS3 = require("../src/actions/publish_analytics_data_to_s3");
const S3Service = require("../src/publish/s3");
const QueryGoogleAnalytics = require("../src/actions/query_google_analytics");
const WriteAnalyticsDataToDatabase = require("../src/actions/write_analytics_data_to_database");

/**
 * Handles processing a chain of actions
 */
class Processor {
  #actions;

  /**
   * @param {import('../actions/action')[]} actions the chain of actions for the
   * processor.
   */
  constructor(actions = []) {
    this.#actions = actions;
  }

  /**
   * Process a chain of actions with a shared context.
   *
   * @param {import('./report_processing_context')} context the shared context.
   */
  async processChain(context) {
    for (const action of this.#actions) {
      if (action.handles(context)) {
        await action.execute(context);
      }
    }
  }

  /**
   * Creates an instance of the Processor class with the actions required to
   * complete the processing of an analytics report. Actions are run
   * sequentially in the order provided to the processor here. The classes
   * referenced here are an implementation of the Chain of Responsibility design
   * pattern.
   *
   * @param {import('../src/app_config')} appConfig an application config instance.
   * @param {import('winston').Logger} logger an application logger instance.
   * @returns {Processor} an initialized processor instance with a chain of
   * analytics processing actions.
   */
  static buildAnalyticsProcessor(appConfig, logger) {
    return new Processor([
      new QueryGoogleAnalytics(
        new GoogleAnalyticsService(
          new BetaAnalyticsDataClient(),
          appConfig,
          logger,
        ),
      ),
      new ProcessGoogleAnalyticsResults(new AnalyticsDataProcessor()),
      new FormatProcessedAnalyticsData(),
      new WriteAnalyticsDataToDatabase(new PostgresPublisher(appConfig)),
      new PublishAnalyticsDataToS3(new S3Service(appConfig)),
      new PublishAnalyticsDataToDisk(),
      new LogAnalyticsData(),
    ]);
  }
}

module.exports = Processor;
