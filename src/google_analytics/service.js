const GoogleAnalyticsQueryAuthorizer = require("./query_authorizer");
const util = require("util");

class GoogleAnalyticsService {
  #analyticsDataClient;
  #config;
  #logger;

  constructor(analyticsDataClient, config, logger) {
    this.#analyticsDataClient = analyticsDataClient;
    this.#config = config;
    this.#logger = logger;
  }

  /**
   * Runs a GA report request. Retries with exponential backoff to help prevent
   * the app failing calls due to API rate limiting.
   *
   * @param {Object} query the report to run in the format required by the GA4
   * reporting API.
   * @param {Boolean} isRealtime true if the report should use the realtime
   * report function
   * @returns {Object} the results of the GA4 report API call.
   */
  async runReportQuery(query, isRealtime = false) {
    const authorizedQuery = await this.#authorizeQuery(query);
    const results = await this.#runAuthorizedReportQuery(
      authorizedQuery,
      isRealtime,
    );
    return results;
  }

  async #authorizeQuery(query) {
    // Have to import this way for ESM modules until the app is fully converted
    // to ESM module imports.
    const { default: pRetry } = await import("p-retry");
    const results = await pRetry(() => {
      return GoogleAnalyticsQueryAuthorizer.authorizeQuery(query, this.#config);
    }, this.#retryOptions());
    return results;
  }

  async #runAuthorizedReportQuery(authorizedQuery, isRealtime) {
    // Have to import this way for ESM modules until the app is fully converted
    // to ESM module imports.
    const { default: pRetry } = await import("p-retry");
    const results = await pRetry(() => {
      return this.#queryGoogleApi(authorizedQuery, isRealtime);
    }, this.#retryOptions());
    return results;
  }

  #queryGoogleApi(authorizedQuery, isRealtime) {
    if (isRealtime) {
      return this.#analyticsDataClient.runRealtimeReport(authorizedQuery);
    } else {
      return this.#analyticsDataClient.runReport(authorizedQuery);
    }
  }

  #retryOptions() {
    return {
      retries: this.#config.ga4CallRetryCount,
      minTimeout: this.#config.ga4CallRetryDelay,
      randomize: true,
      onFailedAttempt: (e) => {
        this.#logger.debug("GA4 API error encountered");
        this.#logger.debug(`retry attempt number: ${e.attemptNumber}`);
        this.#logger.debug(`${e.retriesLeft} retries left`);
        this.#logger.debug(util.inspect(e));
      },
    };
  }
}

module.exports = GoogleAnalyticsService;
