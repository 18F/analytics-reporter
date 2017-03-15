const config = require('../config')

const buildQuery = (report) => {
  let query = Object.assign({}, report.query)
  query = buildQueryArrays(query)
  query.samplingLevel = "HIGHER_PRECISION";
  query['max-results'] = query['max-results'] || 10000;
  query.ids = config.account.ids;
  return query
}

const buildQueryArrays = (query) => {
  query = Object.assign({}, query)
  if (query.dimensions) {
    query.dimensions = query.dimensions.join(",")
  }
  if (query.metrics) {
    query.metrics = query.metrics.join(",")
  }
  if (query.filters) {
    query.filters = query.filters.join(";")
  }
  return query
}

module.exports = { buildQuery }
