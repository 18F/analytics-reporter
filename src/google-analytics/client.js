//const google = require("googleapis")
const { BetaAnalyticsDataClient } = require("@google-analytics/data")
const analyticsDataClient = new BetaAnalyticsDataClient();
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
  //const analytics = google.analytics("v3")
  if (realtime) {
    const [realtimeresponse] =  analyticsDataClient.runRealtimeReport({
      property: `properties/393249053`,
      dateRanges: [
        {
          startDate: '910daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
            name: 'date',
          },
      {
        name: "deviceCategory"
      }
      ],
    
      metrics: [
        {
          name: 'sessions',
        },
      ],"limit":"5","sort":"date"
   
    });//analytics.data.realtime.get
    return realtimeresponse;
  } else {
    const [response] =  analyticsDataClient.runReport({
      property: `properties/393249053`,
      dateRanges: [
        {
          startDate: '910daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
            name: 'date',
          },
      {
        name: "deviceCategory"
      }
      ],
    
      metrics: [
        {
          name: 'sessions',
        },
      ],"limit":"5","sort":"date"
   
    });
    return response;
   
  }
}

module.exports = { fetchData }
