const calculateTotals = (result) => {
  if (result.data.length === 0) {
    return result
  }

  let totals = {}

  // Sum up simple columns
  if ("users" in result.data[0]) {
    totals.users = _sumColumn({ column: "users", result })
  }
  if ("visits" in result.data[0]) {
    totals.visits = _sumColumn({ column: "visits", result })
  }

  // Sum up categories
  if (result.name.match(/^device_model/)) {
    totals.device_models = _sumVisitsByColumn({
      column: "mobile_device",
      result,
    })
  }
  if (result.name.match(/^language/)) {
    totals.languages = _sumVisitsByColumn({
      column: "language",
      result,
    })
  }
  if (result.name.match(/^devices/)) {
    totals.devices = _sumVisitsByColumn({
      column: "device",
      result,
    })
  }
  if (result.name == "screen-size") {
    totals.screen_resolution = _sumVisitsByColumn({
      column: "screen_resolution",
      result,
    })
  }
  if (result.name === "os") {
    totals.os = _sumVisitsByColumn({
      column: "os",
      result,
    })
  }
  if (result.name === "windows") {
    totals.os_version = _sumVisitsByColumn({
      column: "os_version",
      result,
    })
  }
  if (result.name === "browsers") {
    totals.browser = _sumVisitsByColumn({
      column: "browser",
      result,
    })
  }
  if (result.name === "ie") {
    totals.ie_version = _sumVisitsByColumn({
      column: "browser_version",
      result,
    })
  }

  // Sum up totals with 2 levels of hashes
  if (result.name === "os-browsers") {
    totals.by_os = _sumVisitsByCategoryWithDimension({
      column: "os",
      dimension: "browser",
      result,
    })
    totals.by_browsers = _sumVisitsByCategoryWithDimension({
      column: "browser",
      dimension: "os",
      result,
    })
  }
  if (result.name === "windows-ie") {
    totals.by_windows = _sumVisitsByCategoryWithDimension({
      column: "os_version",
      dimension: "browser_version",
      result,
    })
    totals.by_ie = _sumVisitsByCategoryWithDimension({
      column: "browser_version",
      dimension: "os_version",
      result,
    })
  }
  if (result.name === "windows-browsers") {
    totals.by_windows = _sumVisitsByCategoryWithDimension({
      column: "os_version",
      dimension: "browser",
      result,
    })
    totals.by_browsers = _sumVisitsByCategoryWithDimension({
      column: "browser",
      dimension: "os_version",
      result,
    })
  }

  // Set the start and end date
  if (result.data[0].data) {
    // Occasionally we'll get bogus start dates
    if (result.date[0].date === "(other)") {
      totals.start_date = result.data[1].date
    } else {
      totals.start_date = result.data[0].date
    }
    totals.end_date = result.data[result.data.length-1].date
  }

  return totals
}

const _sumColumn = ({ result, column }) => {
  return result.data.reduce((total, row) => {
    return parseInt(row[column]) + total
  }, 0)
}

const _sumVisitsByColumn = ({ result, column }) => {
  return result.data.reduce((categories, row) => {
    const category = row[column]
    const visits = parseInt(row.visits)
    categories[category] = (categories[category] || 0) + visits
    return categories
  }, {})
}

const _sumVisitsByCategoryWithDimension = ({ result, column, dimension }) => {
  return result.data.reduce((categories, row) => {
    const parentCategory = row[column]
    const childCategory = row[dimension]
    const visits = parseInt(row.visits)

    categories[parentCategory] = categories[parentCategory] || {}

    const newTotal = (categories[parentCategory][childCategory] || 0) + visits
    categories[parentCategory][childCategory] = newTotal

    return categories
  }, {})
}

module.exports = { calculateTotals }
