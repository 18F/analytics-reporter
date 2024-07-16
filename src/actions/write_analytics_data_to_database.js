const Action = require("./action");

/**
 * Chain of responsibility action for querying google analytics for data.
 */
class WriteAnalyticsDataToDatabase extends Action {
  #postgresPublisher;

  /**
   * @param {import('../publish/postgres')} postgresPublisher the publisher
   * instance
   */
  constructor(postgresPublisher) {
    super();
    this.#postgresPublisher = postgresPublisher;
  }

  /**
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   * @returns {boolean} true if the application and report config is set to
   * write processed analytics data to the database.
   */
  handles(context) {
    return (
      context.appConfig.shouldWriteToDatabase && !context.reportConfig.realtime
    );
  }

  /**
   * Takes the processed analytics data from the context and writes the data to
   * the postgres database.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Writing report data to database");
    await this.#postgresPublisher.publish(context.processedAnalyticsData);
  }
}

module.exports = WriteAnalyticsDataToDatabase;
