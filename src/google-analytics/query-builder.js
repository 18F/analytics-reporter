const config = require('../config')

const buildQuery = (report) => {
  let query = Object.assign({}, report.query)
  query.limit = query['max-results'] || 10
  query.property = `properties/${config.account.ids}`
  return query
}

module.exports = { buildQuery }
