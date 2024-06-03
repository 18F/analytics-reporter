/**
 * Contains data and actions relevant to the processing of an analytics report.
 * Wraps an instance of AsyncLocalStorage and adds accessors for analytics
 * processing actions to use and encapsulates the details of the store
 * implementation.
 */
class ReportProcessingContext {
  #asyncLocalStorage;

  /**
   * @param {AsyncLocalStorage} asyncLocalStorage the storage instance for
   */
  constructor(asyncLocalStorage) {
    this.#asyncLocalStorage = asyncLocalStorage;
  }

  /**
   * Begins an async function where the AsyncLocalStorage instance's store holds
   * the data for the async function's life.
   * @param {Function} asyncFunction the async function for the class to provide
   * context data.
   * @returns the result of the asyncFunction
   */
  run(asyncFunction) {
    const store = new Map();
    return this.#asyncLocalStorage.run(store, asyncFunction);
  }

  get #store() {
    return this.#asyncLocalStorage.getStore();
  }

  get config() {
    return this.#store.get("config");
  }

  set config(config) {
    this.#store.set("config", config);
  }

  get formattedAnalyticsData() {
    return this.#store.get("formattedAnalyticsData");
  }

  set formattedAnalyticsData(formattedAnalyticsData) {
    this.#store.set("formattedAnalyticsData", formattedAnalyticsData);
  }

  get googleAnalyticsQuery() {
    return this.#store.get("googleAnalyticsQuery");
  }

  set googleAnalyticsQuery(googleAnalyticsQuery) {
    this.#store.set("googleAnalyticsQuery", googleAnalyticsQuery);
  }

  get logger() {
    return this.#store.get("logger");
  }

  set logger(logger) {
    this.#store.set("logger", logger);
  }

  get processedAnalyticsData() {
    return this.#store.get("processedAnalyticsData");
  }

  set processedAnalyticsData(processedAnalyticsData) {
    this.#store.set("processedAnalyticsData", processedAnalyticsData);
  }

  get rawGoogleAnalyticsReportData() {
    return this.#store.get("rawGoogleAnalyticsReportData");
  }

  set rawGoogleAnalyticsReportData(rawGoogleAnalyticsReportData) {
    this.#store.set(
      "rawGoogleAnalyticsReportData",
      rawGoogleAnalyticsReportData,
    );
  }

  get reportConfig() {
    return this.#store.get("reportConfig");
  }

  set reportConfig(reportConfig) {
    this.#store.set("reportConfig", reportConfig);
  }
}

module.exports = ReportProcessingContext;
