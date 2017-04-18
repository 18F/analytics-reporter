const AWS = require("aws-sdk")
const winston = require("winston-color")
const zlib = require("zlib")
const config = require("../config")

// This is the case where using custom s3 api-like services like minio.
const conf = {
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  endpoint: config.aws.endpoint,
  s3ForcePathStyle: config.aws.s3ForcePathStyle,
  signatureVersion: config.aws.signatureVersion
}

const S3 = new AWS.S3(conf)
const publish = (report, results, { format }) => {

  winston.debug("[" + report.name + "] Publishing to " + config.aws.bucket + "...")

  return _compress(results).then(compressed => {
    return S3.putObject({
      Bucket: config.aws.bucket,
      Key: config.aws.path + "/" + report.name + "." + format,
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
