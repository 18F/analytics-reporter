const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const resultsFixture = require("../support/fixtures/results");

let shouldErrorOnSend = false;

class S3ClientMock {
  constructor(config) {
    this.config = config;
  }

  send(command) {
    if (shouldErrorOnSend) {
      shouldErrorOnSend = false;
      return Promise.reject(command);
    } else {
      return Promise.resolve(command);
    }
  }
}

class PutObjectCommandMock {
  constructor(config) {
    this.config = config;
  }
}

const zlibMock = {};

const S3Service = proxyquire("../../src/publish/s3", {
  "@aws-sdk/client-s3": {
    S3Client: S3ClientMock,
    PutObjectCommand: PutObjectCommandMock,
  },
  zlib: zlibMock,
});

describe("S3Service", () => {
  let report;
  let results;
  let subject;
  let appConfig = {};

  beforeEach(() => {
    appConfig = {
      aws: {
        bucket: "test-bucket",
        cache: 60,
        path: "path/to/data",
      },
    };
    results = Object.assign({}, resultsFixture);
    report = { name: results.name };
    zlibMock.gzip = (data, cb) => cb(null, data);
  });

  it("should publish compressed JSON results to the S3 bucket", (done) => {
    appConfig.format = "json";
    report.name = "test-report";
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    subject = new S3Service({ ...appConfig, format: "json" });

    subject
      .publish(
        {
          name: report.name,
          bucket: appConfig.aws.bucket,
          path: appConfig.aws.path,
          format: appConfig.format,
        },
        `${results}`,
      )
      .then((putObjectCommand) => {
        expect(putObjectCommand.config.Key).to.equal(
          "path/to/data/test-report.json",
        );
        expect(putObjectCommand.config.Bucket).to.equal("test-bucket");
        expect(putObjectCommand.config.ContentType).to.equal(
          "application/json",
        );
        expect(putObjectCommand.config.ContentEncoding).to.equal("gzip");
        expect(putObjectCommand.config.ACL).to.equal("public-read");
        expect(putObjectCommand.config.CacheControl).to.equal("max-age=60");
        expect(putObjectCommand.config.Body).to.equal("compressed data");
        expect(gzipCalled).to.equal(true);
        done();
      })
      .catch(done);
  });

  it("should publish CSV results to the S3 bucket", (done) => {
    appConfig.format = "csv";
    appConfig.aws.cache = undefined;
    report.name = "test-report";
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    subject = new S3Service({ ...appConfig, format: "csv" });

    subject
      .publish(
        {
          name: report.name,
          bucket: appConfig.aws.bucket,
          path: appConfig.aws.path,
          format: appConfig.format,
        },
        `${results}`,
      )
      .then((putObjectCommand) => {
        expect(putObjectCommand.config.Key).to.equal(
          "path/to/data/test-report.csv",
        );
        expect(putObjectCommand.config.Bucket).to.equal("test-bucket");
        expect(putObjectCommand.config.ContentType).to.equal("text/csv");
        expect(putObjectCommand.config.ContentEncoding).to.equal("gzip");
        expect(putObjectCommand.config.ACL).to.equal("public-read");
        expect(putObjectCommand.config.CacheControl).to.equal("max-age=0");
        expect(putObjectCommand.config.Body).to.equal("compressed data");
        expect(gzipCalled).to.equal(true);
        done();
      })
      .catch(done);
  });

  it("should reject if there is an error uploading the data", (done) => {
    appConfig.format = "json";
    shouldErrorOnSend = true;
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    subject = new S3Service({ ...appConfig, format: "json" });

    subject
      .publish(
        {
          name: report.name,
          bucket: appConfig.aws.bucket,
          path: appConfig.aws.path,
          format: appConfig.format,
        },
        `${results}`,
      )
      .catch(() => {
        expect(gzipCalled).to.equal(true);
        done();
      })
      .catch(done);
  });

  it("should reject if there is an error compressing the data", (done) => {
    appConfig.format = "json";
    zlibMock.gzip = (data, cb) => cb(new Error("test zlib error"));

    subject = new S3Service({ ...appConfig, format: "json" });

    subject
      .publish(
        {
          name: report.name,
          bucket: appConfig.aws.bucket,
          path: appConfig.aws.path,
          format: appConfig.format,
        },
        `${results}`,
      )
      .catch((err) => {
        expect(err.message).to.equal("test zlib error");
        done();
      })
      .catch(done);
  });
});
