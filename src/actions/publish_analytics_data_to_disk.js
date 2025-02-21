const Action = require("./action");
const DiskPublisher = require("../publish/disk");

/**
 * Chain of responsibility action for writing formatted analytics data to disk
 */
class PublishAnalyticsDataToDisk extends Action {
  /**
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   * @returns {boolean} true if the application config is set to publish data to
   * disk.
   */
  handles(context) {
    return context.appConfig.shouldPublishToDisk;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * disk at a path specified in the application config with the report name as
   * the filename.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Publishing analytics data to disk");
    for (const dataItem of context.formattedAnalyticsData) {
      for (const format of context.appConfig.formats) {
        await DiskPublisher.publish({
          name: dataItem[format].name,
          data: dataItem[format].report,
          format,
          directory: context.appConfig.output,
        });
      }
    }
  }
}

module.exports = PublishAnalyticsDataToDisk;
