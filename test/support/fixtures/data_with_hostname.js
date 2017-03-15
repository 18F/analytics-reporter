module.exports = {
  kind: 'analytics#gaData',
  id: 'https://www.googleapis.com/analytics/v3/data/ga?ids=ga:96302018&dimensions=ga:date,ga:hour&metrics=ga:sessions&start-date=today&end-date=today&max-results=10000',
  query: {
    'start-date': 'today', 'end-date': 'today', ids: 'ga:96302018',
    dimensions: 'ga:date,ga:hour', metrics: [ 'ga:sessions' ],
    'start-index': 1, 'max-results': 10000, samplingLevel: 'HIGHER_PRECISION',
  },
  itemsPerPage: 10000,
  totalResults: 24,
  selfLink: 'https://www.googleapis.com/analytics/v3/data/ga?ids=ga:96302018&dimensions=ga:date,ga:hour&metrics=ga:sessions&start-date=today&end-date=today&max-results=10000',
  profileInfo: {
    profileId: '96302018',
    accountId: '33523145',
    webPropertyId: 'UA-33523145-1',
    internalWebPropertyId: '60822123',
    profileName: 'Z3. Adjusted Gov-Wide Reporting Profile (.gov & .mil only)',
    tableId: 'ga:96302018'
  },
  containsSampledData: false,
  columnHeaders: [
    { name: 'ga:date', columnType: 'DIMENSION', dataType: 'STRING' },
    { name: 'ga:hour', columnType: 'DIMENSION', dataType: 'STRING' },
    { name: 'ga:hostname', columnType: 'DIMENSION', dataType: 'STRING' },
    { name: 'ga:sessions', columnType: 'METRIC', dataType: 'INTEGER' }
  ],
  totalsForAllResults: { 'ga:sessions': '6782212' },
  rows: Array(24).fill(100).map((val, index) => {
    return ["20170130", `${index}`.length < 2 ? `0${index}` : `${index}`, `www.example${index}.com`,`${val}`]
  }),
}
