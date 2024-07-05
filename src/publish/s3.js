const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const zlib = require("zlib");

/**
 * Handles connection to AWS S3 and read/write operations.
 */
class S3Service {
  #appConfig;
  #s3Client;

  /**
   * @param {AppConfig} appConfig application config instance. Provides the
   * configuration  to create an S3 client and the file extension to use for
   * write operations.
   */
  constructor(appConfig) {
    this.#appConfig = appConfig;
    this.#s3Client = this.#buildS3Client(appConfig);
  }

  #buildS3Client(appConfig) {
    // Set AWS environment variables because the S3 client ignores the options
    // passed in for the credentials below.
    process.env.AWS_ACCESS_KEY_ID = appConfig.aws.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = appConfig.aws.secretAccessKey;
    process.env.AWS_REGION = appConfig.aws.region;

    return new S3Client({
      accessKeyId: appConfig.aws.accessKeyId,
      secretAccessKey: appConfig.aws.secretAccessKey,
      endpoint: appConfig.aws.endpoint,
      region: appConfig.aws.region,
      s3ForcePathStyle: appConfig.aws.s3ForcePathStyle,
      signatureVersion: appConfig.aws.signatureVersion,
      requestHandler: new NodeHttpHandler({
        httpAgent: proxyAgent,
        httpsAgent: proxyAgent,
      }),
    });
  }

  /**
   * Writes analytics data to a file in an S3 bucket.
   *
   * @param {String} name the name of the file to write.
   * @param {Object[]} data an array of data points to write to the
   * S3 bucket.
   * @returns {Promise} resolves when the S3 operations complete. Rejects
   * if S3 operations have an error.
   */
  async publish({ name }, data) {
    const compressed = await this.#compress(data);
    const command = new PutObjectCommand({
      Bucket: this.#appConfig.aws.bucket,
      Key: this.#appConfig.aws.path + "/" + name + "." + this.#appConfig.format,
      Body: compressed,
      ContentType: this.#mime(this.#appConfig.format),
      ContentEncoding: "gzip",
      ACL: "public-read",
      CacheControl: "max-age=" + (this.#appConfig.aws.cache || 0),
    });

    return this.#s3Client.send(command);
  }

  #compress(data) {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, compressed) => {
        if (err) {
          reject(err);
        } else {
          resolve(compressed);
        }
      });
    });
  }

  #mime(format) {
    return {
      json: "application/json",
      csv: "text/csv",
    }[format];
  }
}

module.exports = S3Service;
