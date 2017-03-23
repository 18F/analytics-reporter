const csv = require("fast-csv")

const formatResult = (result, { format = "json", slim = false } = {}) => {
  result = Object.assign({}, result)

  switch(format) {
    case "json":
      return _formatJSON(result, { slim })
      break
    case "csv":
      return _formatCSV(result)
      break
    default:
      return Promise.reject("Unsupported format: " + format)
  }
}

const _formatJSON = (result, { slim }) => {
  if (slim) {
   delete result.data
  }
  return Promise.resolve(JSON.stringify(result, null, 2))
}

const _formatCSV = (result) => {
  return new Promise((resolve, reject) => {
    csv.writeToString(result.data, {headers: true}, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports = { formatResult }
