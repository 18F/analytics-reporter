const Action = require("./action");

/**
 * Chain of responsibility action for logging formatted analytics data
 */
class LogAnalyticsData extends Action {
  /**
   * @param {ReportProcessingContext} context the context for the action chain.
   * @returns {Boolean} true if the application config is set to log analytics
   * data
   */
  handles(context) {
    return context.config.shouldLogAnalyticsData;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * the application logs.
   * @param {ReportProcessingContext} context the context for the action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Logging analytics data");
    await context.logger.info(context.formattedAnalyticsData);
  }
}

module.exports = LogAnalyticsData;
