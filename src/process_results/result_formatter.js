const csv = require("fast-csv");

/**
 * Formats a processed Google Analytics report to a JSON string or CSV.
 *
 * NOTE: either option can modify the original object passed to this function.
 * This is necessary because for large datasets, making a copy of the object
 * can use an excessive amount of memory.
 *
 * JSON format with a slim option will delete the processed data's "data" field.
 * CSV format will map headers to readable names for some columns.
 *
 * @param {object} result an analytics object to be formatted.
 * @param {object} config optional configuration for the formatter.
 * @param {string} config.format the format to output can be "json" or "csv"
 * @param {boolean} config.slim whether the result should have it's data field
 * removed from the result of formatting (only for JSON format).
 * @returns {string} a JSON string or a CSV string depending on passed params.
 */
const formatResult = (result, { format = "json", slim = false } = {}) => {
  switch (format) {
    case "json": {
      /* eslint-disable no-unused-vars */
      const { data, ...resultWithoutData } = result;
      return _formatJSON(slim ? resultWithoutData : result);
      /* eslint-enable no-unused-vars */
    }
    case "csv": {
      return _formatCSV({ ...result });
    }
    default: {
      return Promise.reject("Unsupported format: " + format);
    }
  }
};

const _formatJSON = (result) => {
  try {
    return Promise.resolve(JSON.stringify(result, null, 2));
  } catch (e) {
    return Promise.reject(e);
  }
};

const _formatCSV = (result) => {
  return csv.writeToString(_mapCSVHeaders(result.data), { headers: true });
};

function _mapCSVHeaders(dataArray) {
  dataArray.forEach((dataItem, index) => {
    const newDataItem = {};
    Object.keys(dataItem).forEach((key) => {
      if (_keyMappings[key]) {
        newDataItem[_keyMappings[key]] = dataItem[key];
      } else {
        newDataItem[key] = dataItem[key];
      }
    });

    dataArray[index] = newDataItem;
  });
  return dataArray;
}

const _keyMappings = {
  yearMonth: "Month-Year",
  totalUsers: "Total Users",
  activeUsers: "Active Users",
};

module.exports = { formatResult };
