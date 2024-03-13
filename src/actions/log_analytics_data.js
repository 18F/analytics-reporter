const Action = require("./action");

/**
 * Chain of responsibility action for logging formatted analytics data
 */
class LogAnalyticsData extends Action {
  /**
   * @param {AsyncLocalStorage} context the context for the action chain.
   * @returns {Boolean} true if the application config is set to log analytics
   * data
   */
  handles(context) {
    return context.getStore().get("config").shouldLogAnalyticsData;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * the application logs.
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy(context) {
    const store = context.getStore();
    store.get("logger").debug("Logging analytics data");
    await store.get("logger").info(store.get("formattedAnalyticsData"));
  }
}

module.exports = LogAnalyticsData;
