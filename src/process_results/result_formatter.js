const csv = require("fast-csv");

/**
 * @param {Object} result an analytics object to be formatted.
 * @param {Object} config optional configuration for the formatter.
 * @param {String} config.format the format to output can be "json" or "csv"
 * @param {Boolean} config.slim whether the result should have it's data field
 * removed from the result of formatting (only for JSON format).
 * @returns {String} a JSON string or a CSV string depending on passed params.
 */
const formatResult = (result, { format = "json", slim = false } = {}) => {
  result = Object.assign({}, result);

  switch (format) {
    case "json":
      return _formatJSON(result, { slim });
    case "csv":
      return _formatCSV(result);
    default:
      return Promise.reject("Unsupported format: " + format);
  }
};

const _formatJSON = (result, { slim }) => {
  if (slim) {
    delete result.data;
  }
  try {
    return Promise.resolve(JSON.stringify(result, null, 2));
  } catch (e) {
    return Promise.reject(e);
  }
};

const _formatCSV = (result) => {
  return csv.writeToString(result.data, { headers: true });
};

module.exports = { formatResult };
