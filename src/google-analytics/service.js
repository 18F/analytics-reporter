class GoogleAnalyticsService {
  #analyticsDataClient;
  #googleAnalyticsQueryAuthorizer;

  constructor(analyticsDataClient, googleAnalyticsQueryAuthorizer) {
    this.#analyticsDataClient = analyticsDataClient;
    this.#googleAnalyticsQueryAuthorizer = googleAnalyticsQueryAuthorizer;
  }

  async runReportQuery(query, isRealtime = false) {
    const authorizedQuery =
      await this.#googleAnalyticsQueryAuthorizer.authorizeQuery(query);
    const results = await this.#runAuthorizedReportQuery(
      authorizedQuery,
      isRealtime,
    );
    return results;
  }

  #runAuthorizedReportQuery(query, isRealtime) {
    if (isRealtime) {
      return this.#analyticsDataClient.runRealtimeReport(query);
    } else {
      return this.#analyticsDataClient.runReport(query);
    }
  }
}

module.exports = GoogleAnalyticsService;
