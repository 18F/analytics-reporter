/**
 * @param {Object} result the result of the analytics report API call after
 * processing by the AnalyticsDataProcessor.
 * @param {Object} options options for the ResultTotalsCalculator.
 * @param {String[]} options.sumVisitsByColumns an array of columns to be
 * totalled by the number of visits for each unique key in the column.
 * @returns {Object} totals for the results.
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

  if (options.sumVisitsByColumns && Array.isArray(options.sumVisitsByColumns)) {
    for (const column of options.sumVisitsByColumns) {
      totals[`by_${column}`] = _sumVisitsByColumn({ column, result });
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

const _sumVisitsByColumn = ({ result, column }) => {
  return result.data.reduce((categories, row) => {
    const category = row[column];
    const visits = parseInt(row.visits);
    categories[category] = (categories[category] || 0) + visits;
    return categories;
  }, {});
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
