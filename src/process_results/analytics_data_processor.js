const ResultTotalsCalculator = require("./result_totals_calculator");

/**
 * Handles processing operations for raw analytics data.
 */
class AnalyticsDataProcessor {
  #mapping = {
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
   * @param {object} params the method parameters
   * @param {string} params.agency the agency for the report
   * @param {string} params.hostname the hostname for the report
   * @param {object} params.report The report object that was requested
   * @param {object} params.data The response object from the Google Analytics Data API
   * @param {object} params.query The query object for the report
   * @returns {object} The response data transformed to flatten the data
   * structure, format dates, and map from GA keys to DAP keys. Data is filtered
   * as requested in the report object. This object also includes details from
   * the original report and query.
   */
  processData({ agency, hostname, report, data, query }) {
    let result = this.#initializeResult({ agency, report, data, query });

    // If you use a filter that results in no data, you get null
    // back from google and need to protect against it.
    if (!data || !data.rows) {
      return result;
    }

    // Some reports may decide to cut fields from the output.
    if (report.cut) {
      data = this.#removeColumnFromData({ column: report.cut, data });
    }

    // Remove data points that are below the threshold if one exists
    if (report.threshold) {
      data = this.#filterRowsBelowThreshold({
        threshold: report.threshold,
        data,
      });
    }

    // Process each row
    result.data = data.rows.map((row) => {
      return this.#processRow({ hostname, row, data });
    });

    result.totals = ResultTotalsCalculator.calculateTotals(result, {
      sumVisitsByDimensions: report.sumVisitsByDimensions,
      sumUsersByDimensions: report.sumUsersByDimensions,
      sumTotalEventsByDimensions: report.sumTotalEventsByDimensions,
    });

    return result;
  }

  #initializeResult({ agency, report, data, query }) {
    return {
      name: report.name,
      agency: agency ? agency : null,
      sampling: data.metadata?.samplingMetadatas,
      query: ((query) => {
        query = Object.assign({}, query);
        delete query.ids;
        return query;
      })(query),
      meta: report.meta,
      data: [],
      totals: {},
      taken_at: new Date(),
    };
  }

  #removeColumnFromData({ column, data }) {
    data = Object.assign(data);

    const columnToRemove = this.#findDimensionOrMetricIndex(column, data);

    if (columnToRemove != null) {
      data[columnToRemove.rowKey.replace("Values", "Headers")].splice(
        columnToRemove.index,
        1,
      );
      data.rows.forEach((row) => {
        row[columnToRemove.rowKey].splice(columnToRemove.index, 1);
      });
    }

    return data;
  }

  /**
   * If dimension or metric is found matching the provided name, then return an
   * object with rowKey matching the key in row where the value can be found and
   * index of the named value.  If no match is found, return null.
   *
   * @param {string} name the name of the dimension or metric
   * @param {object} data the data row for which to find a header
   * @returns {number} the index of the dimension or metric in the values array
   */
  #findDimensionOrMetricIndex(name, data) {
    const dimensionIndex = data.dimensionHeaders.findIndex((header) => {
      return header.name === name;
    });

    if (dimensionIndex === -1) {
      const metricIndex = data.metricHeaders.findIndex((header) => {
        return header.name === name;
      });

      if (metricIndex === -1) {
        return null;
      } else {
        return { rowKey: "metricValues", index: metricIndex };
      }
    } else {
      return { rowKey: "dimensionValues", index: dimensionIndex };
    }
  }

  #filterRowsBelowThreshold({ threshold, data }) {
    data = Object.assign({}, data);

    const column = this.#findDimensionOrMetricIndex(threshold.field, data);
    if (column != null) {
      data.rows = data.rows.filter((row) => {
        return (
          parseInt(row[column.rowKey][column.index].value) >=
          parseInt(threshold.value)
        );
      });
    }

    return data;
  }

  #processRow({ hostname, row, data }) {
    const point = {};

    // Iterate through each entry in the object
    for (const [entryKey, entryValue] of Object.entries(row)) {
      // Iterate through each object in the array
      entryValue.forEach((item, index) => {
        // Iterate through each key-value pair in the object
        for (const [key, value] of Object.entries(item)) {
          if (key !== "oneValue") {
            const field = this.#fieldNameForColumnIndex({
              entryKey,
              index,
              data,
            });

            let modValue;

            if (field === "date") {
              modValue = this.#formatDate(value);
            } else if (field === "yearMonth") {
              modValue = this.#formatYearMonth(value);
            } else {
              modValue = value;
            }

            point[field] = modValue;
          }
        }
      });
    }

    if (hostname && !("domain" in point)) {
      point.domain = hostname;
    }

    return point;
  }

  #fieldNameForColumnIndex({ entryKey, index, data }) {
    // data keys come back as values for the header keys
    const targetKey = entryKey.replace("Values", "Headers");
    const name = data[targetKey][index].name;
    return this.#mapping[name] || name;
  }

  #formatDate(date) {
    if (date == "(other)") {
      return date;
    }
    return [date.substr(0, 4), date.substr(4, 2), date.substr(6, 2)].join("-");
  }

  /**
   * @param {String} value a yearMonth dimension from GA.
   * @returns {String} the yearMonth converted to readable format e.g '202410'
   * converts to 'October 2024'.
   */
  #formatYearMonth(value) {
    const year = parseInt(value.substring(0, 4));
    const monthIndex = parseInt(value.substring(4)) - 1;
    const date = new Date(year, monthIndex);
    return date.toLocaleString("en-us", { month: "long", year: "numeric" });
  }
}

module.exports = AnalyticsDataProcessor;
