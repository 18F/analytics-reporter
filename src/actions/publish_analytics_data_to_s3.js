const Action = require("./action");

/**
 * Chain of responsibility action for writing formatted analytics data to AWS S3
 */
class PublishAnalyticsDataToS3 extends Action {
  #s3Service;

  /**
   * @param {import('../publish/s3')} s3Service the S3Service instance
   */
  constructor(s3Service) {
    super();
    this.#s3Service = s3Service;
  }

  /**
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   * @returns {boolean} true if the application config is set to publish data to
   * AWS S3.
   */
  handles(context) {
    return context.appConfig.shouldPublishToS3;
  }

  /**
   * Takes the formatted analytics data from the context and writes the data to
   * AWS S3 in a bucket and path specified in the application config with the
   * report name as the filename.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    const appConfig = context.appConfig;
    for (const dataItem of context.formattedAnalyticsData) {
      for (const format of context.appConfig.formats) {
        context.logger.debug(
          `Publishing analytics data to S3 for ${appConfig.aws.path}/${dataItem[format].name}.${format}`,
        );
        await this.#s3Service.publish(
          {
            name: dataItem[format].name,
            bucket: appConfig.aws.bucket,
            path: appConfig.aws.path,
            format,
          },
          dataItem[format].report,
        );
      }
    }
  }
}

module.exports = PublishAnalyticsDataToS3;
