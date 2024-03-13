const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const zlib = require("zlib");

class S3Service {
  #config;
  #s3Client;

  constructor(config) {
    this.#config = config;
    this.#s3Client = this.#buildS3Client(config);
  }

  #buildS3Client(config) {
    // Set AWS environment variables because the S3 client ignores the options
    // passed in for the credentials below.
    process.env.AWS_ACCESS_KEY_ID = config.aws.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = config.aws.secretAccessKey;
    process.env.AWS_REGION = config.aws.region;

    return new S3Client({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      endpoint: config.aws.endpoint,
      region: config.aws.region,
      s3ForcePathStyle: config.aws.s3ForcePathStyle,
      signatureVersion: config.aws.signatureVersion,
    });
  }

  async publish({ name }, data) {
    const compressed = await this.#compress(data);
    const command = new PutObjectCommand({
      Bucket: this.#config.aws.bucket,
      Key: this.#config.aws.path + "/" + name + "." + this.#config.format,
      Body: compressed,
      ContentType: this.#mime(this.#config.format),
      ContentEncoding: "gzip",
      ACL: "public-read",
      CacheControl: "max-age=" + (this.#config.aws.cache || 0),
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
