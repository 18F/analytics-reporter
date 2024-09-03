const Action = require("./action");

/**
 * Chain of responsibility action for processing google analytics data
 */
class ProcessGoogleAnalyticsResults extends Action {
  #analyticsDataProcessor;

  /**
   * @param {import('../process_results/analytics_data_processor')} analyticsDataProcessor
   * the AnalyticsDataProcessor instance
   */
  constructor(analyticsDataProcessor) {
    super();
    this.#analyticsDataProcessor = analyticsDataProcessor;
  }

  /**
   * Takes the raw analytics data from the context, processes it to a flatter
   * object schema, and adds totalling based on report config options. Writes
   * the processed data to the context for use in subsequent actions.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Processing GA report data");
    context.processedAnalyticsData =
      await this.#analyticsDataProcessor.processData({
        agency: context.appConfig.agency ? context.appConfig.agency : null,
        hostname: context.appConfig.account.hostname,
        report: context.reportConfig,
        data: context.rawGoogleAnalyticsReportData[0],
        query: context.googleAnalyticsQuery,
      });
  }
}

module.exports = ProcessGoogleAnalyticsResults;
