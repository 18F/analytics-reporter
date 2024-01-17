const expect = require("chai").expect
const proxyquire = require("proxyquire")
const resultsFixture = require("../support/fixtures/results")

const S3Mock = function() {}
S3Mock.mockedPutObject = () => {}
S3Mock.prototype.putObject = function() {
  return S3Mock.mockedPutObject.apply(this, arguments)
}

const zlibMock = {}

const S3Publisher = proxyquire("../../src/publish/s3", {
  "aws-sdk": { S3: S3Mock },
  "zlib": zlibMock,
  "../config": {
    aws: {
      bucket: "test-bucket",
      cache: 60,
      path: "path/to/data"
    },
  },
})

describe("S3Publisher", () => {
  let report
  let results

  beforeEach(() => {
    results = Object.assign({}, resultsFixture)
    report = { name: results.name }
    S3Mock.mockedPutObject = () => ({ promise: () => Promise.resolve() })
    zlibMock.gzip = (data, cb) => cb(null, data)
  })

  it("should publish compressed JSON results to the S3 bucket", done => {
    report.name = "test-report"

    let s3PutObjectCalled = false
    let gzipCalled = false

    S3Mock.mockedPutObject = (options) => {
      s3PutObjectCalled = true

      expect(options.Key).to.equal("path/to/data/test-report.json")
      expect(options.Bucket).to.equal("test-bucket")
      expect(options.ContentType).to.equal("application/json")
      expect(options.ContentEncoding).to.equal("gzip")
      expect(options.ACL).to.equal("public-read")
      expect(options.CacheControl).to.equal("max-age=60")
      expect(options.Body).to.equal("compressed data")

      return { promise: () => Promise.resolve() }
    }
    zlibMock.gzip = (data, cb) => {
      gzipCalled = true
      cb(null, "compressed data")
    }

    S3Publisher.publish(report, `${results}`, { format: "json" }).then(() => {
      expect(s3PutObjectCalled).to.equal(true)
      expect(gzipCalled).to.equal(true)
      done()
    }).catch(done)
  })

  it("should publish compressed CSV results to the S3 bucket", done => {
    report.name = "test-report"

    let s3PutObjectCalled = false
    let gzipCalled = false

    S3Mock.mockedPutObject = (options) => {
      s3PutObjectCalled = true

      expect(options.Key).to.equal("path/to/data/test-report.csv")
      expect(options.Bucket).to.equal("test-bucket")
      expect(options.ContentType).to.equal("text/csv")
      expect(options.ContentEncoding).to.equal("gzip")
      expect(options.ACL).to.equal("public-read")
      expect(options.CacheControl).to.equal("max-age=60")
      expect(options.Body).to.equal("compressed data")

      return { promise: () => Promise.resolve() }
    }
    zlibMock.gzip = (data, cb) => {
      gzipCalled = true
      cb(null, "compressed data")
    }

    S3Publisher.publish(report, `${results}`, { format: "csv" }).then(() => {
      expect(s3PutObjectCalled).to.equal(true)
      expect(gzipCalled).to.equal(true)
      done()
    }).catch(done)
  })

  it("should reject if there is an error uploading the data", done => {
    S3Mock.mockedPutObject = () => ({
      promise: () => Promise.reject(new Error("test s3 error"))
    })

    S3Publisher.publish(report, `${results}`, { format: "json" }).catch(err => {
      expect(err.message).to.equal("test s3 error")
      done()
    }).catch(done)
  })

  it("should reject if there is an error compressing the data", done => {
    zlibMock.gzip = (data, cb) => cb(new Error("test zlib error"))

    S3Publisher.publish(report.name, `${results}`, { format: "json" }).catch(err => {
      expect(err.message).to.equal("test zlib error")
      done()
    }).catch(done)
  })
})
