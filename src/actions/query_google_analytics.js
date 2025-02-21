const Action = require("./action");
const GoogleAnalyticsQueryBuilder = require("../google_analytics/query_builder");

/**
 * Chain of responsibility action for querying google analytics for data.
 */
class QueryGoogleAnalytics extends Action {
  #googleAnalyticsService;

  /**
   * @param {import('../google_analytics/service')} googleAnalyticsService the
   * google analytics service instance.
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
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    const agency = context.appConfig.agency ? context.appConfig.agency : null;
    const reportConfig = context.reportConfig;
    const queries = await GoogleAnalyticsQueryBuilder.buildQueries(
      reportConfig,
      context.appConfig,
    );

    context.logger.debug("Fetching analytics report data from GA");
    const dataItems = [];
    for (const query of queries) {
      const queryResult = await this.#googleAnalyticsService.runReportQuery(
        query,
        reportConfig.realtime,
      );
      queryResult.forEach((result) => {
        dataItems.push(result);
      });
    }

    context.googleAnalyticsReportData = dataItems.map((dataItem, index) => {
      if (reportConfig.dateRanges && reportConfig.dateRanges[index]) {
        dataItem.name = `${reportConfig.name}-${reportConfig.dateRanges[index]}`;
      } else {
        dataItem.name = reportConfig.name;
      }
      dataItem.processData(reportConfig, agency);
      dataItem.addTotals(reportConfig);
      return { name: dataItem.name, report: dataItem.toJSON() };
    });
  }
}

module.exports = QueryGoogleAnalytics;
