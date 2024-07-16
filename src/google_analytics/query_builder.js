/**
 * @param {object} reportConfig report config for the query to be created.
 * @param {import('../app_config')} appConfig application config instance.
 * @returns {object} an object in the correct syntax for the google analytics
 * reporting API to execute.
 */
const buildQuery = (reportConfig, appConfig) => {
  let query = Object.assign({}, reportConfig.query);
  query.limit = query["limit"] || "10000";
  query.property = `properties/${appConfig.account.ids}`;
  query.ids = appConfig.account.ids;
  return query;
};

module.exports = { buildQuery };
