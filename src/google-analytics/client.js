const google = require("googleapis")
const GoogleAnalyticsQueryAuthorizer = require("./query-authorizer")
const GoogleAnalyticsQueryBuilder = require("./query-builder")

const fetchData = (report) => {
  const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
  return GoogleAnalyticsQueryAuthorizer.authorizeQuery(query).then(query => {
    return _executeFetchDataRequest(query, { realtime: report.realtime })
  })
}

const _executeFetchDataRequest = (query, { realtime }) => {
  return new Promise((resolve, reject) => {
    _get(realtime)(query, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const _get = (realtime) => {
  const analytics = google.analytics("v3")
  if (realtime) {
    return analytics.data.realtime.get
  } else {
    return analytics.data.ga.get
  }
}

module.exports = { fetchData }
