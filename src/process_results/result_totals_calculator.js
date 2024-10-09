/**
 * @param {object} result the result of the analytics report API call after
 * processing by the AnalyticsDataProcessor.
 * @param {object} options options for the ResultTotalsCalculator.
 * @param {string[]} options.sumVisitsByColumns an array of columns to be
 * totalled by the number of visits for each unique key in the column.
 * @returns {object} totals for the results.
 */
const calculateTotals = (result, options = {}) => {
  if (result.data.length === 0) {
    return {};
  }

  let totals = {};

  // Sum up simple columns
  if ("users" in result.data[0]) {
    totals.users = _sumColumn({ column: "users", result });
  }
  if ("visits" in result.data[0]) {
    totals.visits = _sumColumn({ column: "visits", result });
  }
  if ("total_events" in result.data[0]) {
    totals.total_events = _sumColumn({ column: "total_events", result });
  }

  if (options.sumVisitsByColumns && Array.isArray(options.sumVisitsByColumns)) {
    for (const column of options.sumVisitsByColumns) {
      totals[`by_${column}`] = _sumMetricByColumn({
        metric: "visits",
        column,
        result,
      });
      totals[`by_${column}`] = _sortObjectByValues(totals[`by_${column}`]);
    }
  }

  if (options.sumUsersByColumns && Array.isArray(options.sumUsersByColumns)) {
    for (const column of options.sumUsersByColumns) {
      totals[`by_${column}`] = _sumMetricByColumn({
        metric: "users",
        column,
        result,
      });
    }
  }

  if (
    options.sumTotalEventsByColumns &&
    Array.isArray(options.sumTotalEventsByColumns)
  ) {
    for (const column of options.sumTotalEventsByColumns) {
      totals[`by_${column}`] = _sumMetricByColumn({
        metric: "total_events",
        column,
        result,
      });
      totals[`by_${column}`] = _sortObjectByValues(totals[`by_${column}`]);
    }
  }

  // Sum up totals with 2 levels of hashes
  if (result.name === "os-browsers") {
    totals.by_os = _sumVisitsByCategoryWithDimension({
      column: "os",
      dimension: "browser",
      result,
    });
    totals.by_browsers = _sumVisitsByCategoryWithDimension({
      column: "browser",
      dimension: "os",
      result,
    });
  }
  if (result.name === "windows-browsers") {
    totals.by_windows = _sumVisitsByCategoryWithDimension({
      column: "os_version",
      dimension: "browser",
      result,
    });
    totals.by_browsers = _sumVisitsByCategoryWithDimension({
      column: "browser",
      dimension: "os_version",
      result,
    });
  }

  // Set the start and end date
  if (result.data[0].data) {
    // Occasionally we'll get bogus start dates
    if (result.date[0].date === "(other)") {
      totals.start_date = result.data[1].date;
    } else {
      totals.start_date = result.data[0].date;
    }
    totals.end_date = result.data[result.data.length - 1].date;
  }

  return totals;
};

const _sumColumn = ({ result, column }) => {
  return result.data.reduce((total, row) => {
    return parseInt(row[column]) + total;
  }, 0);
};

const _sumMetricByColumn = ({ metric, result, column }) => {
  return result.data.reduce((categories, row) => {
    const category = row[column];
    const count = parseInt(row[metric]);
    categories[category] = (categories[category] || 0) + count;
    return _sortObjectByValues(categories);
  }, {});
};

const _sortObjectByValues = (object) => {
  return Object.fromEntries(Object.entries(object).sort((a, b) => b[1] - a[1]));
};

const _sumVisitsByCategoryWithDimension = ({ result, column, dimension }) => {
  return result.data.reduce((categories, row) => {
    const parentCategory = row[column];
    const childCategory = row[dimension];
    const visits = parseInt(row.visits);

    categories[parentCategory] = categories[parentCategory] || {};

    const newTotal = (categories[parentCategory][childCategory] || 0) + visits;
    categories[parentCategory][childCategory] = newTotal;

    return categories;
  }, {});
};

module.exports = { calculateTotals };
