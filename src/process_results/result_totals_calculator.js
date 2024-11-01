/**
 * @param {object} result the result of the analytics report API call after
 * processing by the AnalyticsDataProcessor.
 * @param {object} options options for the ResultTotalsCalculator.
 * @param {string[]} options.sumVisitsByDimensions an array of columns to be
 * totalled by the number of visits for each unique key in the column.
 * @returns {object} totals for the results.
 */
const calculateTotals = (result, options = {}) => {
  if (result.data.length === 0) {
    return {};
  }

  let totalledResult = result.data.reduce((totals, row) => {
    // Sum up simple metrics
    _sumMetric({ totals, metricName: "totalUsers", row });
    _sumMetric({ totals, metricName: "visits", row });
    _sumMetric({ totals, metricName: "total_events", row });

    if (
      options.sumVisitsByDimensions &&
      Array.isArray(options.sumVisitsByDimensions)
    ) {
      for (const dimensionName of options.sumVisitsByDimensions) {
        _sumMetricByDimension({
          totals,
          metricName: "visits",
          dimensionName,
          row,
        });
      }
    }

    if (
      options.sumUsersByDimensions &&
      Array.isArray(options.sumUsersByDimensions)
    ) {
      for (const dimensionName of options.sumUsersByDimensions) {
        _sumMetricByDimension({
          totals,
          metricName: "totalUsers",
          dimensionName,
          row,
        });
      }
    }

    if (
      options.sumTotalEventsByDimensions &&
      Array.isArray(options.sumTotalEventsByDimensions)
    ) {
      for (const dimensionName of options.sumTotalEventsByDimensions) {
        _sumMetricByDimension({
          totals,
          metricName: "total_events",
          dimensionName,
          row,
        });
      }
    }

    // Sum up totals with 2 levels of hashes
    if (result.name === "os-browsers") {
      _sumUsersByCategoryWithDimension({
        totals,
        parentDimensionName: "os",
        childDimensionName: "browser",
        totalName: "by_os",
        row,
      });
      _sumUsersByCategoryWithDimension({
        totals,
        parentDimensionName: "browser",
        childDimensionName: "os",
        totalName: "by_browsers",
        row,
      });
    }
    if (result.name === "windows-browsers") {
      _sumUsersByCategoryWithDimension({
        totals,
        parentDimensionName: "os_version",
        childDimensionName: "browser",
        totalName: "by_windows",
        row,
      });
      _sumUsersByCategoryWithDimension({
        totals,
        parentDimensionName: "browser",
        childDimensionName: "os_version",
        totalName: "by_browsers",
        row,
      });
    }

    return totals;
  }, {});

  // Sort the totals
  totalledResult = _sortObjectByValues(totalledResult);
  for (const key of Object.keys(totalledResult)) {
    if (typeof totalledResult[key] === "object") {
      totalledResult[key] = _sortObjectByValues(totalledResult[key]);
    }
  }

  // Set the start and end date
  if (result.data[0].data) {
    // Occasionally we'll get bogus start dates
    if (result.date[0].date === "(other)") {
      totalledResult.start_date = result.data[1].date;
    } else {
      totalledResult.start_date = result.data[0].date;
    }
    totalledResult.end_date = result.data[result.data.length - 1].date;
  }

  return totalledResult;
};

function _sumMetric({ totals, metricName, row }) {
  if (!row[metricName]) {
    return;
  }

  const count = parseInt(row[metricName]);
  totals[metricName] = (totals[metricName] || 0) + count;
}

function _sumMetricByDimension({ totals, metricName, row, dimensionName }) {
  if (!totals[`by_${dimensionName}`]) {
    totals[`by_${dimensionName}`] = {};
  }

  const dimensionValue = row[dimensionName];
  const count = parseInt(row[metricName]);
  totals[`by_${dimensionName}`][dimensionValue] =
    (totals[`by_${dimensionName}`][dimensionValue] || 0) + count;
}

function _sumUsersByCategoryWithDimension({
  totals,
  parentDimensionName,
  childDimensionName,
  totalName,
  row,
}) {
  if (!totals[totalName]) {
    totals[totalName] = {};
  }

  const parentDimensionValue = row[parentDimensionName];
  const childDimensionValue = row[childDimensionName];
  const users = parseInt(row.totalUsers);

  totals[totalName][parentDimensionValue] =
    totals[totalName][parentDimensionValue] || {};

  const newTotal =
    (totals[totalName][parentDimensionValue][childDimensionValue] || 0) + users;
  totals[totalName][parentDimensionValue][childDimensionValue] = newTotal;
}

function _sortObjectByValues(object) {
  return Object.fromEntries(
    Object.entries(object).sort(([, a], [, b]) => b - a),
  );
}

module.exports = { calculateTotals };
