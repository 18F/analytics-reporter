const { google } = require("googleapis");
const GoogleAnalyticsQueryAuthorizer = require("./query-authorizer");
const GoogleAnalyticsQueryBuilder = require("./query-builder");

const fetchData = (report) => {
  const query = GoogleAnalyticsQueryBuilder.buildQuery(report);
  return GoogleAnalyticsQueryAuthorizer.authorizeQuery(query).then((query) => {
    return _executeFetchDataRequest(query);
  });
};

const _executeFetchDataRequest = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await _get(query);
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};

const _get = (query) => {
  const analytics = google.analytics({ version: "v3" });
  return analytics.data.ga.get(query);
};

module.exports = { fetchData };
