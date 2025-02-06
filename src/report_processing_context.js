/**
 * Contains data and actions relevant to the processing of an analytics report.
 * Wraps an instance of AsyncLocalStorage and adds accessors for analytics
 * processing actions to use and encapsulates the details of the store
 * implementation.
 */
class ReportProcessingContext {
  #asyncLocalStorage;

  /**
   * @param {import('node:async_hooks').AsyncLocalStorage} asyncLocalStorage the
   * storage instance which a data store for the context.
   */
  constructor(asyncLocalStorage) {
    this.#asyncLocalStorage = asyncLocalStorage;
  }

  /**
   * Begins an async function where the AsyncLocalStorage instance's store holds
   * the data for the async function's life.
   *
   * @param {Function} asyncFunction the async function for the class to provide
   * context data.
   * @returns {Promise} the result of the asyncFunction
   */
  run(asyncFunction) {
    const store = new Map();
    return this.#asyncLocalStorage.run(store, asyncFunction);
  }

  get #store() {
    return this.#asyncLocalStorage.getStore();
  }

  get appConfig() {
    return this.#store.get("appConfig");
  }

  set appConfig(appConfig) {
    this.#store.set("appConfig", appConfig);
  }

  get formattedAnalyticsData() {
    return this.#store.get("formattedAnalyticsData");
  }

  set formattedAnalyticsData(formattedAnalyticsData) {
    this.#store.set("formattedAnalyticsData", formattedAnalyticsData);
  }

  get logger() {
    return this.#store.get("logger");
  }

  set logger(logger) {
    this.#store.set("logger", logger);
  }

  get googleAnalyticsReportData() {
    return this.#store.get("googleAnalyticsReportData");
  }

  set googleAnalyticsReportData(googleAnalyticsReportData) {
    this.#store.set("googleAnalyticsReportData", googleAnalyticsReportData);
  }

  get reportConfig() {
    return this.#store.get("reportConfig");
  }

  set reportConfig(reportConfig) {
    this.#store.set("reportConfig", reportConfig);
  }
}

module.exports = ReportProcessingContext;
