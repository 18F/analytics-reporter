const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const resultsFixture = require("../support/fixtures/results");
const { should } = require("chai");

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

const S3Publisher = proxyquire("../../src/publish/s3", {
  "@aws-sdk/client-s3": {
    S3Client: S3ClientMock,
    PutObjectCommand: PutObjectCommandMock,
  },
  zlib: zlibMock,
  "../config": {
    aws: {
      bucket: "test-bucket",
      cache: 60,
      path: "path/to/data",
    },
  },
});

describe("S3Publisher", () => {
  let report;
  let results;

  beforeEach(() => {
    results = Object.assign({}, resultsFixture);
    report = { name: results.name };
    zlibMock.gzip = (data, cb) => cb(null, data);
  });

  it("should publish compressed JSON results to the S3 bucket", (done) => {
    report.name = "test-report";
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    S3Publisher.publish(report, `${results}`, { format: "json" })
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

  it("should publish compressed CSV results to the S3 bucket", (done) => {
    report.name = "test-report";
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    S3Publisher.publish(report, `${results}`, { format: "csv" })
      .then((putObjectCommand) => {
        expect(putObjectCommand.config.Key).to.equal(
          "path/to/data/test-report.csv",
        );
        expect(putObjectCommand.config.Bucket).to.equal("test-bucket");
        expect(putObjectCommand.config.ContentType).to.equal("text/csv");
        expect(putObjectCommand.config.ContentEncoding).to.equal("gzip");
        expect(putObjectCommand.config.ACL).to.equal("public-read");
        expect(putObjectCommand.config.CacheControl).to.equal("max-age=60");
        expect(putObjectCommand.config.Body).to.equal("compressed data");
        expect(gzipCalled).to.equal(true);
        done();
      })
      .catch(done);
  });

  it("should reject if there is an error uploading the data", (done) => {
    shouldErrorOnSend = true;
    let gzipCalled = false;

    zlibMock.gzip = (data, cb) => {
      gzipCalled = true;
      cb(null, "compressed data");
    };

    S3Publisher.publish(report, `${results}`, { format: "json" })
      .catch((err) => {
        expect(gzipCalled).to.equal(true);
        done();
      })
      .catch(done);
  });

  it("should reject if there is an error compressing the data", (done) => {
    zlibMock.gzip = (data, cb) => cb(new Error("test zlib error"));

    S3Publisher.publish(report.name, `${results}`, { format: "json" })
      .catch((err) => {
        expect(err.message).to.equal("test zlib error");
        done();
      })
      .catch(done);
  });
});
