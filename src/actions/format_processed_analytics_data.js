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
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy(context) {
    const store = context.getStore();
    const config = store.get("config");
    const data = store.get("processedAnalyticsData");

    store.get("logger").debug("Formatting analytics data");
    store.set(
      "formattedAnalyticsData",
      await ResultFormatter.formatResult(data, {
        format: config.format,
        slim: config.slim && store.get("reportConfig").slim,
      }),
    );
  }
}

module.exports = FormatProcessedAnalyticsData;
