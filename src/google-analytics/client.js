const { BetaAnalyticsDataClient } = require("@google-analytics/data")
const analyticsDataClient = new BetaAnalyticsDataClient();
const GoogleAnalyticsQueryAuthorizer = require("./query-authorizer")
const GoogleAnalyticsQueryBuilder = require("./query-builder")

const fetchData = (report) => {
  const query = GoogleAnalyticsQueryBuilder.buildQuery(report)

  return GoogleAnalyticsQueryAuthorizer.authorizeQuery(query).then(query => {
    return _executeFetchDataRequest({ realtime: report.realtime }, query)
  })
}

const _executeFetchDataRequest = ({ realtime }, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await _get(realtime, query);
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

async function _get(realtime, query) {
  if (realtime === true) {
    const realTimeResponse = await analyticsDataClient.runRealtimeReport(query);
    return realTimeResponse;
  } else {
    const response = await analyticsDataClient.runReport(query);
    return response;
  }
}

module.exports = { fetchData };
