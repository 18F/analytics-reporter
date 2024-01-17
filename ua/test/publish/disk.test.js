const expect = require("chai").expect
const proxyquire = require("proxyquire")

describe("DiskPublisher", () => {
  let DiskPublisher
  let fs = {}

  beforeEach(() => {
    fs = { writeFile: (path, contents, cb) => cb() }
    DiskPublisher = proxyquire("../../src/publish/disk", {
      fs: fs,
    })
  })

  describe(".publish(report, results, options)", () => {
    context("when the format is json", () => {
      it("should write the results to <output>/<report name>.json", done => {
        const options = { output: "path/to/output", format: "json" }
        const report = { name: "report-name" }
        const results = "I'm the results"

        let fileWritten = false
        fs.writeFile = (path, contents, cb) => {
          expect(path).to.equal("path/to/output/report-name.json")
          expect(contents).to.equal("I'm the results")
          fileWritten = true
          cb(null)
        }

        DiskPublisher.publish(report, results, options).then(() => {
          expect(fileWritten).to.be.true
          done()
        }).catch(done)
      })
    })

    context("when the format is csv", () => {
      it("should write the results to <output>/<report name>.csv", done => {
        const options = { output: "path/to/output", format: "csv" }
        const report = { name: "report-name" }
        const results = "I'm the results"

        let fileWritten = false
        fs.writeFile = (path, contents, cb) => {
          expect(path).to.equal("path/to/output/report-name.csv")
          expect(contents).to.equal("I'm the results")
          fileWritten = true
          cb(null)
        }

        DiskPublisher.publish(report, results, options).then(() => {
          expect(fileWritten).to.be.true
          done()
        }).catch(done)
      })
    })
  })
})
