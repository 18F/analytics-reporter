const Action = require("./action");

/**
 * Chain of responsibility action for logging formatted analytics data
 */
class LogAnalyticsData extends Action {
  /**
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   * @returns {boolean} true if the application config is set to log analytics
   * data
   */
  handles(context) {
    return context.appConfig.shouldLogAnalyticsData;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * the application logs.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Logging analytics data");
    for (const format of context.appConfig.formats) {
      await context.logger.info(context.formattedAnalyticsData[format]);
    }
  }
}

module.exports = LogAnalyticsData;
