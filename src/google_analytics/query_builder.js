const {
  differenceInDays,
  startOfYear,
  subYears,
  isBefore,
} = require("date-fns");

/**
 * @param {object} reportConfig report config for the query to be created.
 * @param {import('../app_config')} appConfig application config instance.
 * @returns {object[]} an array of objects in the correct syntax for the google
 * analytics reporting API to execute.
 */
const buildQueries = (reportConfig, appConfig) => {
  const query = { ...reportConfig.query };
  query.limit = query["limit"] || "10000";
  query.property = `properties/${appConfig.account.ids}`;
  query.ids = appConfig.account.ids;

  const queries = reportConfig.dateRanges
    ? _buildQueriesForRanges(reportConfig, query)
    : [query];

  return queries.map((builtQuery) => _addBotTrafficFilter(builtQuery));
};

function _buildQueriesForRanges(reportConfig, query) {
  const queries = [];
  const chunkSize = reportConfig.dateRangeChunkSize || 1;
  for (let i = 0; i < reportConfig.dateRanges.length; i += chunkSize) {
    const chunk = reportConfig.dateRanges.slice(i, i + chunkSize);
    const newQuery = { ...query, dateRanges: _toReportingApiDateRanges(chunk) };
    queries.push(newQuery);
  }
  return queries;
}

function _toReportingApiDateRanges(unparsedRanges) {
  return unparsedRanges.map((rangeString) => {
    return _mapStringToDateRange(rangeString);
  });
}

function _mapStringToDateRange(rangeString) {
  const today = () => new Date();
  const startOfCurrentYear = () => startOfYear(today());
  const startOfPreviousYear = () =>
    startOfYear(subYears(startOfCurrentYear(), 1));
  const startOfCurrentFiscalYear = () => {
    const nextFiscalYearStart = () => new Date(today().getFullYear(), 9, 1);
    if (isBefore(today(), nextFiscalYearStart())) {
      return subYears(nextFiscalYearStart(), 1);
    } else {
      return nextFiscalYearStart();
    }
  };
  const startOfPreviousFiscalYear = () =>
    subYears(startOfCurrentFiscalYear(), 1);
  const daysSinceStartOfCurrentYear = differenceInDays(
    today(),
    startOfCurrentYear(),
  );
  const daysSinceStartOfPreviousYear =
    differenceInDays(startOfCurrentYear(), startOfPreviousYear()) +
    daysSinceStartOfCurrentYear;
  const daysSinceStartOfCurrentFiscalYear = differenceInDays(
    today(),
    startOfCurrentFiscalYear(),
  );
  const daysSinceStartOfPreviousFiscalYear =
    differenceInDays(startOfCurrentFiscalYear(), startOfPreviousFiscalYear()) +
    daysSinceStartOfCurrentFiscalYear;
  const descriptorToDateRangeHashMap = {
    yesterday: { startDate: "yesterday", endDate: "yesterday" },
    "7-days": { startDate: "7daysAgo", endDate: "yesterday" },
    "30-days": { startDate: "30daysAgo", endDate: "yesterday" },
    "90-days": { startDate: "90daysAgo", endDate: "yesterday" },
    "current-year": {
      startDate: `${daysSinceStartOfCurrentYear}daysAgo`,
      endDate: "yesterday",
    },
    "current-fiscal-year": {
      startDate: `${daysSinceStartOfCurrentFiscalYear}daysAgo`,
      endDate: "yesterday",
    },
    "previous-year": {
      startDate: `${daysSinceStartOfPreviousYear}daysAgo`,
      endDate: `${daysSinceStartOfCurrentYear + 1}daysAgo`,
    },
    "previous-fiscal-year": {
      startDate: `${daysSinceStartOfPreviousFiscalYear}daysAgo`,
      endDate: `${daysSinceStartOfCurrentFiscalYear + 1}daysAgo`,
    },
  };

  return descriptorToDateRangeHashMap[rangeString];
}

function _addBotTrafficFilter(query) {
  const filterExpression = _botTrafficFilter();
  const queryWithFilter = { ...query };

  if (!query.dimensionFilter) {
    queryWithFilter.dimensionFilter = filterExpression;
    return queryWithFilter;
  }

  // if (
  //   query.dimensionFilter.andGroup &&
  //   Array.isArray(query.dimensionFilter.andGroup.expressions)
  // ) {
  //   queryWithFilter.dimensionFilter = {
  //     andGroup: {
  //       expressions: [
  //         ...query.dimensionFilter.andGroup.expressions,
  //         filterExpression,
  //       ],
  //     },
  //   };
  //   return queryWithFilter;
  // }

  queryWithFilter.dimensionFilter = {
    andGroup: {
      expressions: [query.dimensionFilter, filterExpression],
    },
  };

  return queryWithFilter;
}

function _botTrafficFilter() {
  // Identifies events with a specific signature
  // characteristic of a wave of bot traffic that began in Sept 2025
  const late2025ChinaSingaporeFilter = {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: "screenResolution",
            stringFilter: {
              matchType: "EXACT",
              value: "1280x1200",
            },
          },
        },
        {
          filter: {
            fieldName: "country",
            inListFilter: {
              values: ["China", "Singapore"],
            },
          },
        },
      ],
    },
  };

  return {
    notExpression: { ...late2025ChinaSingaporeFilter },
  };
}

module.exports = { buildQueries };
