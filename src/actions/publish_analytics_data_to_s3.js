const Action = require("./action");

/**
 * Chain of responsibility action for writing formatted analytics data to AWS S3
 */
class PublishAnalyticsDataToS3 extends Action {
  #s3Service;

  /**
   * @param {S3Service} s3Service
   */
  constructor(s3Service) {
    super();
    this.#s3Service = s3Service;
  }

  /**
   * @param {AsyncLocalStorage} context the context for the action chain.
   * @returns {Boolean} true if the application config is set to publish data to
   * AWS S3.
   */
  handles(context) {
    return context.getStore().get("config").shouldPublishToS3;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * AWS S3 in a bucket and path specified in the application config with the
   * report name as the filename.
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy(context) {
    const store = context.getStore();
    store.get("logger").debug("Publishing analytics data to S3");
    await this.#s3Service.publish(
      store.get("reportConfig"),
      store.get("formattedAnalyticsData"),
    );
  }
}

module.exports = PublishAnalyticsDataToS3;
