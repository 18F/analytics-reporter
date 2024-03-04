/**
 * A sample response from the Google Analytics Data API to use for testing.
 * Response data schema can be found here:
 * https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/RunReportResponse
 */
module.exports = {
  /**
   * @typedef {Object} Row
   * @property {Object[]} dimensionValues
   * @property {Object[]} metricValues
   */

  /**
   * @param Object[] Describes dimension columns. The number of DimensionHeaders
   * and ordering of DimensionHeaders matches the dimensions present in rows.
   */
  dimensionHeaders: [{ name: "date" }, { name: "hour" }],
  /**
   * @param Object[] Describes metric columns. The number of MetricHeaders and
   * ordering of MetricHeaders matches the metrics present in rows.
   */
  metricHeaders: [{ name: "sessions", type: "TYPE_INTEGER" }],
  /**
   * @param Row[] Rows of dimension value combinations and metric values in the
   * report.
   */
  rows: Array.from(Array(24), (_, index) => {
    return {
      dimensionValues: [
        {
          value: "20170130",
          oneValue: "value",
        },
        {
          value: `${index}`.length < 2 ? `0${index}` : `${index}`,
          oneValue: "value",
        },
      ],
      metricValues: [{ value: `100`, oneValue: "value" }],
    };
  }),
  /**
   * @param Row[] If requested, the totaled values of metrics.
   */
  totals: [],
  /**
   * @param Number The total number of rows in the query result. rowCount is
   * independent of the number of rows returned in the response, the limit
   * request parameter, and the offset request parameter. For example if a query
   * returns 175 rows and includes limit of 50 in the API request, the response
   * will contain rowCount of 175 but only 50 rows.
   */
  rowCount: 24,
  /**
   * @param Row[] If requested, the minimum values of metrics.
   */
  minimums: [],
  /**
   * @param Row[] If requested, the maximum values of metrics.
   */
  maximums: [],
  /**
   * @param ResponseMetaData metadata carrying additional information about the
   * report content.
   */
  metadata: {
    dataLossFromOtherRow: false,
    currencyCode: "USD",
    _currencyCode: "currencyCode",
    timeZone: "America/New_York",
    _timeZone: "timeZone",
  },
  propertyQuota: null,
  kind: "analyticsData#runReport",
};
