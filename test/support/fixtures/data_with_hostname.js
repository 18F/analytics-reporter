module.exports = {
  dimensionHeaders: [{ name: "hostName" }],
  metricHeaders: [{ name: "sessions", type: "TYPE_INTEGER" }],
  rows: Array.from(Array(24), (_, index) => {
    return {
      dimensionValues: [
        { value: `www.example${index}.com`, oneValue: "value" },
      ],
      metricValues: [{ value: `${index}`, oneValue: "value" }],
    };
  }),
  totals: [],
  rowCount: 24,
  minimums: [],
  maximums: [],
  metadata: {
    dataLossFromOtherRow: false,
    currencyCode: "USD",
    _currencyCode: "currencyCode",
    timeZone: "America/New_York",
    _timeZone: "timeZone",
  },
  propertyQuota: null,
  kind: "analyticsData#runReport",
};
