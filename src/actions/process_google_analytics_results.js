const Action = require("./action");

/**
 * Chain of responsibility action for processing google analytics data
 */
class ProcessGoogleAnalyticsResults extends Action {
  #analyticsDataProcessor;

  /**
   * @param {AnalyticsDataProcessor} analyticsDataProcessor
   */
  constructor(analyticsDataProcessor) {
    super();
    this.#analyticsDataProcessor = analyticsDataProcessor;
  }

  /**
   * Takes the raw analytics data from the context, processes it to a flatter
   * object schema, and adds totalling based on report config options. Writes
   * the processed data to the context for use in subsequent actions.
   * @param {ReportProcessingContext} context the context for the action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Processing GA report data");
    context.processedAnalyticsData =
      await this.#analyticsDataProcessor.processData(
        context.reportConfig,
        context.rawGoogleAnalyticsReportData[0],
        context.googleAnalyticsQuery,
      );
  }
}

module.exports = ProcessGoogleAnalyticsResults;
