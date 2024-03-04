const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const zlib = require("zlib");
const config = require("../config");
const Logger = require("../../src/logger");
const logger = Logger.initialize();

// This is the case where using custom s3 api-like services like minio.
const s3config = {
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  endpoint: config.aws.endpoint,
  region: config.aws.region,
  s3ForcePathStyle: config.aws.s3ForcePathStyle,
  signatureVersion: config.aws.signatureVersion,
};

const s3Client = new S3Client(s3config);
const publish = async (report, results, { format }) => {
  logger.debug(
    `${Logger.tag(report.name)} Publishing to ${config.aws.bucket}...`,
  );

  const compressed = await _compress(results);
  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: config.aws.path + "/" + report.name + "." + format,
    Body: compressed,
    ContentType: _mime(format),
    ContentEncoding: "gzip",
    ACL: "public-read",
    CacheControl: "max-age=" + (config.aws.cache || 0),
  });

  return s3Client.send(command);
};

const _compress = (data) => {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (err, compressed) => {
      if (err) {
        reject(err);
      } else {
        resolve(compressed);
      }
    });
  });
};

const _mime = (format) => {
  return {
    json: "application/json",
    csv: "text/csv",
  }[format];
};

module.exports = { publish };
