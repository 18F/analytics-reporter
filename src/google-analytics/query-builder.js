const config = require('../config')

const buildQuery = (report) => {
  let query = Object.assign({}, report.query)
  query.samplingLevel = "HIGHER_PRECISION";
  query.limit = query['limit'] || "10000"
  query.property = `properties/${config.account.ids}`
  query.ids = config.account.ids;
  return query
}

module.exports = { buildQuery }
