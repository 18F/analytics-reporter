const Action = require("./action");
const ResultFormatter = require("../process_results/result_formatter");

/**
 * Chain of responsibility action for formatting processed analytics data
 */
class FormatProcessedAnalyticsData extends Action {
  /**
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   * @returns {boolean} true if the application config is set to format
   * processed analytics data.
   */
  handles(context) {
    return context.appConfig.formats.length > 0;
  }

  /**
   * Takes the processed analytics data from the context and changes the format
   * to JSON or CSV based on application and report config options. Writes the
   * formatted data to the context for use in subsequent actions. Removes the
   * processed analytics data from the context to free memory when report data
   * is very large.
   *
   * @param {import('../report_processing_context')} context the context for the
   * action chain.
   */
  async executeStrategy(context) {
    context.logger.debug("Formatting analytics data");

    let formattedAnalyticsData = [];
    for (const dataItem of context.googleAnalyticsReportData) {
      let formattedDataItem = {};
      for (const format of context.appConfig.formats) {
        formattedDataItem[format] = {
          name: dataItem.name,
          report: await ResultFormatter.formatResult(dataItem.report, {
            format,
            slim: context.appConfig.slim && context.reportConfig.slim,
          }),
        };
      }
      formattedAnalyticsData.push(formattedDataItem);
      formattedDataItem = undefined;
    }
    context.googleAnalyticsReportData = undefined;
    context.formattedAnalyticsData = formattedAnalyticsData;
    formattedAnalyticsData = undefined;
  }
}

module.exports = FormatProcessedAnalyticsData;
