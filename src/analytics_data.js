/**
 * Data object for a runReport or runRealtimeReport response from the Google
 * Analytics Data API.
 */
class AnalyticsData {
  #query;
  #data;

  /**
   * @param {object} query the query details used in the request to the google
   * analytics data API.
   * @param {object[]} data the response data from the request to the google
   * analytics data API.
   * @returns {AnalyticsData} the built class instance.
   */
  constructor(query, data) {
    this.#query = query;
    this.#data = data;
  }

  /**
   * @returns {object} the class converted to a JSON object.
   */
  toJSON() {
    return {
      ...(this.#query && { query: this.#query }),
      ...(this.#data && { data: this.#data }),
    };
  }

  /**
   * @param query
   * @param {object} googleAnalyticsReportResponse the response from a google
   * analytics runReport or runRealtimeReport API request.
   * @returns {AnalyticsData} the built class instance.
   */
  static fromGoogleAnalyticsQuery(query, googleAnalyticsReportResponse) {
    if (!query || !googleAnalyticsReportResponse) {
      return [];
    }
    const dataObjects = [];

    if (query.dateRanges.length > 1) {
      const { dateRanges, ...queryWithoutDateRanges } = query;
      dateRanges.forEach((dateRange, index) => {
        dataObjects.push(
          this.reportForDateRange(
            dateRange,
            `date_range_${index}`,
            queryWithoutDateRanges,
            googleAnalyticsReportResponse[0],
          ).toJSON(),
        );
      });
      return dataObjects;
    } else {
      dataObjects.push(
        new AnalyticsData(
          query,
          this.parseData(googleAnalyticsReportResponse[0]),
        ).toJSON(),
      );
    }

    return dataObjects;
  }

  /**
   * @param dateRange
   * @param dateRangeName
   * @param queryWithoutDateRanges
   * @param googleAnalyticsReportResponse
   */
  static reportForDateRange(
    dateRange,
    dateRangeName,
    queryWithoutDateRanges,
    googleAnalyticsReportResponse,
  ) {
    const rows = googleAnalyticsReportResponse.rows.filter((row) => {
      return row.dimensionValues.find((dimension) => {
        return dimension.value == dateRangeName;
      });
    });
    return new AnalyticsData(
      { ...queryWithoutDateRanges, dateRanges: [dateRange] },
      this.parseData({ ...googleAnalyticsReportResponse, rows }),
    );
  }

  /**
   * @param root0
   * @param root0.metricHeaders
   * @param root0.dimensionHeaders
   * @param root0.rows
   */
  static parseData({ metricHeaders, dimensionHeaders, rows = [] }) {
    const data = [];
    rows.forEach((row) => {
      const dataPoint = {};
      dimensionHeaders.forEach((dimension, index) => {
        if (dimension.name != "dateRange") {
          dataPoint[dimension.name] = row.dimensionValues[index].value;
        }
      });
      metricHeaders.forEach((metric, index) => {
        dataPoint[metric.name] = row.metricValues[index].value;
      });
      data.push(dataPoint);
    });
    return data;
  }
}

module.exports = AnalyticsData;
