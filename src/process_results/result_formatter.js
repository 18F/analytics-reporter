const csv = require("fast-csv");

/**
 * @param {object} result an analytics object to be formatted.
 * @param {object} config optional configuration for the formatter.
 * @param {string} config.format the format to output can be "json" or "csv"
 * @param {boolean} config.slim whether the result should have it's data field
 * removed from the result of formatting (only for JSON format).
 * @returns {string} a JSON string or a CSV string depending on passed params.
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
