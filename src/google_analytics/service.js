const GoogleAnalyticsQueryAuthorizer = require("./query_authorizer");
const util = require("util");
const AnalyticsData = require("../analytics_data");

/**
 * Handles connection to Google Analytics and query operations.
 */
class GoogleAnalyticsService {
  #analyticsDataClient;
  #appConfig;
  #logger;

  /**
   * @param {import('@google-analytics/data').BetaAnalyticsDataClient} analyticsDataClient
   * the client for Google Analytics Data API operations.
   * @param {import('../app_config')} appConfig application config instance. Provides the
   * configuration  to create an S3 client and the file extension to use for
   * write operations.
   * @param {import('winston').Logger} logger a logger instance.
   */
  constructor(analyticsDataClient, appConfig, logger) {
    this.#analyticsDataClient = analyticsDataClient;
    this.#appConfig = appConfig;
    this.#logger = logger;
  }

  /**
   * Runs a GA report request. Retries with exponential backoff to help prevent
   * the app failing calls due to API rate limiting.
   *
   * @param {object} query the report to run in the format required by the GA4
   * reporting API.
   * @param {boolean} isRealtime true if the report should use the realtime
   * report function
   * @returns {object[]} the results of the GA4 report API call.
   */
  async runReportQuery(query, isRealtime = false) {
    const authorizedQuery = await this.#authorizeQuery(query);
    const results = AnalyticsData.fromGoogleAnalyticsQuery(
      query,
      await this.#runAuthorizedReportQuery(authorizedQuery, isRealtime),
    );
    this.#logger.debug("auth call successful");
    return results;
  }

  async #authorizeQuery(query) {
    // Have to import this way for ESM modules until the app is fully converted
    // to ESM module imports.
    const { default: pRetry } = await import("p-retry");
    const results = await pRetry(() => {
      this.#logger.debug("Running GA4 authorizeQuery");
      return GoogleAnalyticsQueryAuthorizer.authorizeQuery(
        query,
        this.#appConfig,
      );
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
      this.#logger.debug("Running GA4 runRealtimeReport");
      return this.#analyticsDataClient.runRealtimeReport(authorizedQuery);
    } else {
      this.#logger.debug("Running GA4 runReport");
      return this.#analyticsDataClient.runReport(authorizedQuery);
    }
  }

  #retryOptions() {
    return {
      retries: this.#appConfig.ga4CallRetryCount,
      minTimeout: this.#appConfig.ga4CallRetryDelay,
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
