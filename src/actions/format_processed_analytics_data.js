const Action = require("./action");
const ResultFormatter = require("../process_results/result_formatter");

/**
 * Chain of responsibility action for formatting processed analytics data
 */
class FormatProcessedAnalyticsData extends Action {
  /**
   * Takes the processed analytics data from the context and changes the format
   * to JSON or CSV based on application and report config options. Writes the
   * formatted data to the context for use in subsequent actions.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Formatting analytics data");
    const formattedAnalyticsData = {};
    for (const format of context.appConfig.formats) {
      formattedAnalyticsData[format] = await ResultFormatter.formatResult(
        context.processedAnalyticsData,
        {
          format,
          slim: context.appConfig.slim && context.reportConfig.slim,
        },
      );
    }
    context.formattedAnalyticsData = formattedAnalyticsData;
  }
}

module.exports = FormatProcessedAnalyticsData;
