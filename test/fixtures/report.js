module.exports = {
  "name": "today",
  "frequency": "hourly",
  "query": {
    "dimensions": ["ga:date", "ga:hour"],
    "metrics": ["ga:sessions"],
    "start-date": "today",
    "end-date": "today",
  },
  "meta": {
    "name": "Today",
    "description": "Today's visits for all sites."
  },
}
