const buildQuery = (report, config) => {
  let query = Object.assign({}, report.query);
  query.limit = query["limit"] || "10000";
  query.property = `properties/${config.account.ids}`;
  query.ids = config.account.ids;
  return query;
};

module.exports = { buildQuery };
