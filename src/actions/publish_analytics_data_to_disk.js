const Action = require("./action");
const DiskPublisher = require("../publish/disk");

/**
 * Chain of responsibility action for writing formatted analytics data to disk
 */
class PublishAnalyticsDataToDisk extends Action {
  /**
   * @param {ReportProcessingContext} context the context for the action chain.
   * @returns {Boolean} true if the application config is set to publish data to
   * disk.
   */
  handles(context) {
    return context.config.shouldPublishToDisk;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * disk at a path specified in the application config with the report name as
   * the filename.
   * @param {ReportProcessingContext} context the context for the action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Publishing analytics data to disk");
    await DiskPublisher.publish(
      context.reportConfig,
      context.formattedAnalyticsData,
      context.config,
    );
  }
}

module.exports = PublishAnalyticsDataToDisk;
