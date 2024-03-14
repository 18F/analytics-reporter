const util = require("util");

class GoogleAnalyticsService {
  #analyticsDataClient;
  #googleAnalyticsQueryAuthorizer;
  #config;
  #logger;

  constructor(
    analyticsDataClient,
    googleAnalyticsQueryAuthorizer,
    config,
    logger,
  ) {
    this.#analyticsDataClient = analyticsDataClient;
    this.#googleAnalyticsQueryAuthorizer = googleAnalyticsQueryAuthorizer;
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
    // Have to import this way for ESM modules until the app is fully converted
    // to ESM module imports.
    const { default: pRetry } = await import("p-retry");
    const authorizedQuery = await pRetry(() => {
      return this.#googleAnalyticsQueryAuthorizer.authorizeQuery(query);
    }, this.#retryOptions());
    const results = await pRetry(() => {
      return this.#runAuthorizedReportQuery(authorizedQuery, isRealtime);
    }, this.#retryOptions());
    return results;
  }

  #runAuthorizedReportQuery(query, isRealtime) {
    if (isRealtime) {
      return this.#analyticsDataClient.runRealtimeReport(query);
    } else {
      return this.#analyticsDataClient.runReport(query);
    }
  }

  #retryOptions() {
    return {
      retries: this.#config.ga4_call_retry_count,
      minTimeout: this.#config.ga4_call_retry_delay,
      randomize: true,
      onFailedAttempt: (e, attemptNumber) => {
        this.#logger.debug("GA4 API error encountered");
        this.#logger.debug(`retry attempt number: ${attemptNumber}`);
        this.#logger.debug(util.inspect(e));
      },
    };
  }
}

module.exports = GoogleAnalyticsService;
