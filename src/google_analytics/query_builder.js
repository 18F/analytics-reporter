/**
 * @param {Object} reportConfig report config for the query to be created.
 * @param {Config} config application config instance.
 * @returns {Object} an object in the correct syntax for the google analytics
 * reporting API to execute.
 */
const buildQuery = (reportConfig, config) => {
  let query = Object.assign({}, reportConfig.query);
  query.limit = query["limit"] || "10000";
  query.property = `properties/${config.account.ids}`;
  query.ids = config.account.ids;
  return query;
};

module.exports = { buildQuery };
