const expect = require("chai").expect
const proxyquire = require("proxyquire")
const resultFixture = require("./support/fixtures/results")

describe("main", () => {
  describe(".run(options)", () => {
    const consoleLogOriginal = console.log
    after(() => {
      console.log = consoleLogOriginal
    })

    const config = {}

    let Analytics
    let DiskPublisher
    let PostgresPublisher
    let ResultFormatter
    let S3Publisher
    let result
    let main

    beforeEach(() => {
      result = {}
      Analytics = {
        reports: [{ name: "a" }, { name: "b" }, { name: "c" }],
        query: (report) => Promise.resolve(Object.assign(result, { name: report.name })),
      }
      DiskPublisher = {}
      PostgresPublisher = {}
      ResultFormatter = {
        formatResult: (result) => Promise.resolve(JSON.stringify(result))
      }
      S3Publisher = {}

      main = proxyquire("../index.js", {
        "./src/config": config,
        "./src/analytics": Analytics,
        "./src/publish/disk": DiskPublisher,
        "./src/publish/postgres": PostgresPublisher,
        "./src/process-results/result-formatter": ResultFormatter,
        "./src/publish/s3": S3Publisher,
      })
    })

    it("should query for every single report", done => {
      const queriedReportNames = []

      Analytics.query = (report) => {
        queriedReportNames.push(report.name)
        return Promise.resolve(result)
      }

      main.run().then(() => {
        expect(queriedReportNames).to.include.members(["a", "b", "c"])
        done()
      }).catch(done)
    })

    it("should log formatted results", done => {
      ResultFormatter.formatResult = () => Promise.resolve("I'm the results!")

      let consoleLogCalled = false
      console.log = function(output) {
        if (output === "I'm the results!") {
          consoleLogCalled = true
        } else {
          consoleLogOriginal.apply(this, arguments)
        }
      }

      main.run().then(() => {
        console.log = consoleLogOriginal
        expect(consoleLogCalled).to.be.true
        done()
      }).catch(err => {
        console.log = consoleLogOriginal
        done(err)
      })
    })

    it("should format the results with the format set to JSON", done => {
      let formatResultCalled = false
      ResultFormatter.formatResult = (result, options) => {
        expect(options.format).to.equal("json")
        formatResultCalled = true
        return Promise.resolve("")
      }

      main.run().then(() => {
        expect(formatResultCalled).to.be.true
        done()
      }).catch(done)
    })

    context("with --output option", () => {
      it("should write the results to the given path folder", done => {
        ResultFormatter.formatResult = () => Promise.resolve("I'm the result")

        const writtenReportNames = []
        DiskPublisher.publish = (report, formattedResult, options) => {
          expect(options.format).to.equal("json")
          expect(options.output).to.equal("path/to/output")
          expect(formattedResult).to.equal("I'm the result")
          writtenReportNames.push(report.name)
        }

        main.run({ output: "path/to/output" }).then(() => {
          expect(writtenReportNames).to.include.members(["a", "b", "c"])
          done()
        }).catch(done)
      })
    })

    context("with --publish option", () => {
      it("should publish the results to s3", done => {
        result = { data: "I'm the result" }

        const publishedReportNames = []
        S3Publisher.publish = (report, formattedResult, options) => {
          expect(options.format).to.equal("json")
          expect(JSON.parse(formattedResult)).to.deep.equal(result)
          publishedReportNames.push(report.name)
        }

        main.run({ publish: true }).then(() => {
          expect(publishedReportNames).to.include.members(["a", "b", "c"])
          done()
        }).catch(done)
      })
    })

    context("with --write-to-database option", () => {
      it("should write the results to postgres", done => {
        result = { data: "I am the result" }

        let publishCalled = false
        PostgresPublisher.publish = (resultToPublish) => {
          expect(resultToPublish).to.deep.equal(result)
          publishCalled = true
          return Promise.resolve()
        }

        main.run({ ["write-to-database"]: true }).then(() => {
          expect(publishCalled).to.be.true
          done()
        }).catch(done)
      })

      it("should not write the results to postgres if the report is realtime", done => {
        let publishCalled = false
        PostgresPublisher.publish = () => {
          publishCalled = true
          return Promise.resolve()
        }

        main.run({ ["write-to-database"]: false }).then(() => {
          expect(publishCalled).to.be.false
          done()
        }).catch(done)
      })
    })

    context("with --only option", () => {
      it("should only query the given report", done => {
        const queriedReportNames = []

        Analytics.query = (report) => {
          queriedReportNames.push(report.name)
          return Promise.resolve(result)
        }

        main.run({ only: "a" }).then(() => {
          expect(queriedReportNames).to.include("a")
          expect(queriedReportNames).not.to.include.members(["b", "c"])
          done()
        }).catch(done)
      })
    })

    context("with --slim option", () => {
      it("should format the results with the slim option for slim reports", done => {
        Analytics.reports = [
          { name: "a", slim: false },
          { name: "b", slim: true },
          { name: "c", slim: false },
        ]

        const formattedSlimReportNames = []
        const formattedRegularReportNames = []
        ResultFormatter.formatResult = (result, options) => {
          if (options.slim === true) {
            formattedSlimReportNames.push(result.name)
          } else {
            formattedRegularReportNames.push(result.name)
          }
          return Promise.resolve("")
        }

        main.run({ slim: true }).then(() => {
          expect(formattedSlimReportNames).to.include.members(["b"])
          expect(formattedRegularReportNames).to.include.members(["a", "c"])
          done()
        }).catch(done)
      })
    })

    context("with --csv option", () => {
      it("should format the reports with the format set to csv", done => {
        const formattedReportNames = []
        ResultFormatter.formatResult = (result, options) => {
          expect(options.format).to.equal("csv")
          formattedReportNames.push(result.name)
          return Promise.resolve("")
        }

        main.run({ csv: true }).then(() => {
          expect(formattedReportNames).to.include.members(["a", "b", "c"])
          done()
        }).catch(done)
      })

      it("should publish the reports with the format set to csv", done => {
        result = { data: "I'm the result" }

        const publishedReportNames = []
        S3Publisher.publish = (report, formattedResult, options) => {
          expect(options.format).to.equal("csv")
          publishedReportNames.push(report.name)
        }

        main.run({ publish: true, csv: true }).then(() => {
          expect(publishedReportNames).to.include.members(["a", "b", "c"])
          done()
        }).catch(done)
      })
    })

    context("with --frequency option", () => {
      it("should only query reports with the given frequency", done => {
        Analytics.reports = [
          { name: "a", frequency: "daily" },
          { name: "b", frequency: "hourly" },
          { name: "c", frequency: "daily" },
        ]

        const queriedReportNames = []

        Analytics.query = (report) => {
          queriedReportNames.push(report.name)
          return Promise.resolve(result)
        }

        main.run({ frequency: "daily" }).then(() => {
          expect(queriedReportNames).to.include.members(["a", "c"])
          expect(queriedReportNames).not.to.include.members(["b"])
          done()
        }).catch(done)
      })
    })
  })
})
