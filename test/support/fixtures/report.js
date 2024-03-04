module.exports = {
  name: "today",
  frequency: "hourly",
  query: {
    dimensions: [{ name: "date" }, { name: "hour" }],
    metrics: [{ name: "sessions" }],
    dateRanges: [{ startDate: "today", endDate: "today" }],
  },
  meta: {
    name: "Today",
    description: "Today's visits for all sites.",
  },
};
