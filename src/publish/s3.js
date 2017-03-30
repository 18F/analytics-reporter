const AWS = require("aws-sdk")
const winston = require("winston-color")
const zlib = require("zlib")
const config = require("../config")

const S3 = new AWS.S3()

const publish = (results, { format }) => {
  winston.debug("[" + results.name + "] Publishing to " + config.aws.bucket + "...")

  return _compress(results).then(compressed => {
    return S3.putObject({
      Bucket: config.aws.bucket,
      Key: config.aws.path + "/" + results.name + "." + format,
      Body: compressed,
      ContentType: _mime(format),
      ContentEncoding: "gzip",
      ACL: "public-read",
      CacheControl: "max-age=" + (config.aws.cache || 0),
    }).promise()
  })
}

const _compress = (data) => {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (err, compressed) => {
      if (err) {
        reject(err)
      } else {
        resolve(compressed)
      }
    })
  })
}

const _mime = (format) => {
  return {
    json: "application/json",
    csv: "text/csv",
  }[format]
}

module.exports = { publish }
