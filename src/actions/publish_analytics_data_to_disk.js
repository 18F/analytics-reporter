const Action = require("./action");
const DiskPublisher = require("../publish/disk");

/**
 * Chain of responsibility action for writing formatted analytics data to disk
 */
class PublishAnalyticsDataToDisk extends Action {
  /**
   * @param {AsyncLocalStorage} context the context for the action chain.
   * @returns {Boolean} true if the application config is set to publish data to
   * disk.
   */
  handles(context) {
    return context.getStore().get("config").shouldPublishToDisk;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * disk at a path specified in the application config with the report name as
   * the filename.
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy(context) {
    const store = context.getStore();
    store.get("logger").debug("Publishing analytics data to disk");
    await DiskPublisher.publish(
      store.get("reportConfig"),
      store.get("formattedAnalyticsData"),
      store.get("config"),
    );
  }
}

module.exports = PublishAnalyticsDataToDisk;
