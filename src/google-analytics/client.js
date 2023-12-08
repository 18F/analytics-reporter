//const google = require("googleapis")
const { BetaAnalyticsDataClient } = require("@google-analytics/data")
const analyticsDataClient = new BetaAnalyticsDataClient();
// const GoogleAnalyticsQueryAuthorizer = require("./query-authorizer")
const GoogleAnalyticsQueryBuilder = require("./query-builder")

const fetchData = (report) => {
  const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
  return _get({ realtime: report.realtime }, query)

  // return GoogleAnalyticsQueryAuthorizer.authorizeQuery(query).then(query => {
    // return _executeFetchDataRequest(query, { realtime: report.realtime })
  // })
}

// const _executeFetchDataRequest = (query, { realtime }) => {
//   return new Promise((resolve, reject) => {
//     _get(realtime, query, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };

  async function _get(realtime, query) {
    if (realtime === true) {
      const realTimeResponse = await analyticsDataClient.runRealtimeReport(query);
      return realTimeResponse
    } else {
      const response = await analyticsDataClient.runReport(query);
      return response
    }
  }

module.exports = { fetchData }
