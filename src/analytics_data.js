const { lightFormat, parse } = require("date-fns");
const ResultTotalsCalculator = require("./process_results/result_totals_calculator");

const DATA_COLUMN_NAME_MAPPING = {
  fileExtension: "file_extension",
  fileName: "file_name",
  fullPageUrl: "page",
  pageTitle: "page_title",
  unifiedScreenName: "page_title",
  sessions: "visits",
  deviceCategory: "device",
  operatingSystem: "os",
  operatingSystemVersion: "os_version",
  hostName: "domain",
  languageCode: "language_code",
  sessionSource: "source",
  sessionSourceMedium: "session_source_medium",
  eventName: "event_label",
  eventCount: "total_events",
  landingPagePlusQueryString: "landing_page",
  sessionDefaultChannelGroup: "session_default_channel_group",
  screenPageViews: "pageviews",
  screenPageViewsPerSession: "pageviews_per_session",
  averageSessionDuration: "avg_session_duration",
  bounceRate: "bounce_rate",
  screenResolution: "screen_resolution",
  mobileDeviceModel: "mobile_device",
  videoUrl: "video_url",
  videoTitle: "video_title",
};

/**
 * Data object for a runReport or runRealtimeReport response from the Google
 * Analytics Data API.
 */
class AnalyticsData {
  #agency;
  #data;
  #meta;
  #name;
  #query;
  #sampling;
  #taken_at;
  #totals;

  /**
   * @param {object} query the query details used in the request to the google
   * analytics data API.
   * @param {object} data the response data from the request to the google
   * analytics data API.
   * @returns {AnalyticsData} the built class instance.
   */
  constructor(query, data) {
    this.#query = query;
    this.#data = data;
    this.#totals = {};
    this.#taken_at = new Date();
  }

  /**
   * @returns {string} the name of the report.
   */
  get name() {
    return this.#name;
  }

  /**
   * @param {string} name the name for the report.
   */
  set name(name) {
    this.#name = name;
  }

  /**
   * @param {object} sampling the sampling details for the report.
   */
  set sampling(sampling) {
    this.#sampling = sampling;
  }

  /**
   * Sets class data fields, converts dimension/metric names via map, and
   * formats dates.
   *
   * @param {object} reportConfig provides metadata for the data
   * @param {string} agency sets the agency for the data
   */
  processData(reportConfig, agency) {
    this.#agency = agency;
    this.#meta = reportConfig.meta;
    this.#data.forEach((dataObject) => {
      for (const [key, value] of Object.entries(dataObject)) {
        const mappedKey = this.#mapKey(key);

        if (key !== mappedKey) {
          dataObject[mappedKey] = dataObject[key];
          delete dataObject[key];
        }

        if (mappedKey === "date") {
          dataObject[mappedKey] = this.#formatDate(value);
        } else if (mappedKey === "yearMonth") {
          dataObject[mappedKey] = this.#formatYearMonth(value);
        }
      }
    });
  }

  /**
   * @param {object} reportConfig provides options for the total calculator.
   */
  addTotals(reportConfig) {
    this.#totals = ResultTotalsCalculator.calculateTotals(
      { data: this.#data },
      {
        sumVisitsByDimensions: reportConfig.sumVisitsByDimensions,
        sumActiveUsersByDimensions: reportConfig.sumActiveUsersByDimensions,
        sumTotalUsersByDimensions: reportConfig.sumTotalUsersByDimensions,
        sumTotalEventsByDimensions: reportConfig.sumTotalEventsByDimensions,
      },
    );
  }

  #mapKey(key) {
    return DATA_COLUMN_NAME_MAPPING[key] || key;
  }

  #formatDate(dateString) {
    if (dateString == "(other)") {
      return dateString;
    }

    let result;
    try {
      result = lightFormat(
        parse(dateString, "yyyyMMdd", new Date()),
        "yyyy-MM-dd",
      );
    } catch (e) {
      result = dateString;
    }
    return result;
  }

  /**
   * @param {string} value a yearMonth dimension from GA.
   * @returns {string} the yearMonth converted to readable format e.g '202410'
   * converts to 'October 2024'.
   */
  #formatYearMonth(value) {
    const year = parseInt(value.substring(0, 4));
    const monthIndex = parseInt(value.substring(4)) - 1;
    const date = new Date(year, monthIndex);
    return date.toLocaleString("en-us", { month: "long", year: "numeric" });
  }

  /**
   * @returns {object} the class converted to a JSON object.
   */
  toJSON() {
    return {
      ...(this.#name && { name: this.#name }),
      agency: this.#agency || null,
      ...(this.#sampling && { sampling: this.#sampling }),
      ...(this.#query && { query: this.#query }),
      ...(this.#meta && { meta: this.#meta }),
      ...(this.#data && { data: this.#data }),
      ...(this.#totals && { totals: this.#totals }),
      ...(this.#taken_at && { taken_at: this.#taken_at }),
    };
  }

  /**
   * @param {object} query the query which was used to acquire the report
   * response.
   * @param {object} googleAnalyticsReportResponse the response from a google
   * analytics runReport or runRealtimeReport API request.
   * @returns {AnalyticsData[]} the built AnalyticsData objects for each query
   * result.
   */
  static fromGoogleAnalyticsQuery(query, googleAnalyticsReportResponse) {
    if (!query || !googleAnalyticsReportResponse) {
      return [];
    }
    const dataObjects = [];

    if (query.dateRanges && query.dateRanges.length > 1) {
      const { dateRanges, ...queryWithoutDateRanges } = query;
      dateRanges.forEach((dateRange, index) => {
        const analyticsData = this.reportForDateRange(
          dateRange,
          `date_range_${index}`,
          queryWithoutDateRanges,
          googleAnalyticsReportResponse[0],
        );
        analyticsData.sampling =
          googleAnalyticsReportResponse[0].metadata?.samplingMetadatas;
        dataObjects.push(analyticsData);
      });
    } else {
      const analyticsData = new AnalyticsData(
        query,
        this.parseData(googleAnalyticsReportResponse[0]),
      );
      analyticsData.sampling =
        googleAnalyticsReportResponse[0].metadata?.samplingMetadatas;
      dataObjects.push(analyticsData);
    }

    return dataObjects;
  }

  /**
   * @param {object} dateRange the date range object for the query
   * @param {string} dateRangeName the name of the value for the date range
   * dimension in the query results
   * @param {object} queryWithoutDateRanges the query used for the report API
   * call with dateRanges omitted
   * @param {object} googleAnalyticsReportResponse the response from the run
   * report API call
   * @returns {AnalyticsData[]} an AnalyticsData instance with query and data
   * filtered to the date range.
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
   * @param {object} params the params
   * @param {object[]} params.metricHeaders the metric headers
   * @param {object[]} params.dimensionHeaders the dimension headers
   * @param {object[]} params.rows the data items relating to the headers
   * @returns {object[]} the data items converted to objects with
   * metricName: metricValue and dimensionName: dimensionValue for all key pairs
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
