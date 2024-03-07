const csv = require("fast-csv");

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
