const Action = require("./action");

/**
 * Chain of responsibility action for querying google analytics for data.
 */
class WriteAnalyticsDataToDatabase extends Action {
  #postgresPublisher;

  /**
   *
   * @param {PostgresPublisher} postgresPublisher
   */
  constructor(postgresPublisher) {
    super();
    this.#postgresPublisher = postgresPublisher;
  }

  /**
   * @param {AsyncLocalStorage} context the context for the action chain.
   * @returns {Boolean} true if the application and report config is set to
   * write processed analytics data to the database.
   */
  handles(context) {
    const store = context.getStore();
    return (
      store.get("config").shouldWriteToDatabase &&
      !store.get("reportConfig").realtime
    );
  }

  /**
   * Takes the processed analytics data from the context and writes the data to
   * the postgres database.
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy(context) {
    const store = context.getStore();
    store.get("logger").debug("Writing report data to database");
    await this.#postgresPublisher.publish(store.get("processedAnalyticsData"));
  }
}

module.exports = WriteAnalyticsDataToDatabase;
