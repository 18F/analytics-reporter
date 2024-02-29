const fs = require("fs")
const path = require("path")

const publish = (report, results, { output, format }) => {
  const filename = `${report.name}.${format}`
  const filepath = path.join(output, filename)

  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, results, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

module.exports = { publish }
