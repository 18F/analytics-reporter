const Action = require("./action");
const GoogleAnalyticsQueryBuilder = require("../google_analytics/query_builder");

/**
 * Chain of responsibility action for querying google analytics for data.
 */
class QueryGoogleAnalytics extends Action {
  #googleAnalyticsService;

  /**
   * @param {GoogleAnalyticsService} googleAnalyticsService
   */
  constructor(googleAnalyticsService) {
    super();
    this.#googleAnalyticsService = googleAnalyticsService;
  }

  /**
   * Takes the application and report configuration from the context and builds
   * a query which is valid for the google analytics data API. The query is then
   * passed to the google analytics service to make the API call(s) necessary to
   * retrieve the data. The analytics data and the query are set to the context
   * to be used by subsequent actions.
   * @param {ReportProcessingContext} context the context for the action chain.
   */
  async executeStrategy(context) {
    const reportConfig = context.reportConfig;
    const query = await GoogleAnalyticsQueryBuilder.buildQuery(
      reportConfig,
      context.appConfig,
    );
    context.googleAnalyticsQuery = query;

    context.logger.debug("Fetching analytics report data from GA");
    context.rawGoogleAnalyticsReportData =
      await this.#googleAnalyticsService.runReportQuery(
        query,
        reportConfig.realtime,
      );
  }
}

module.exports = QueryGoogleAnalytics;
