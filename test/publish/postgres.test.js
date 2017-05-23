const { ANALYTICS_DATA_TABLE_NAME } = require("../../src/publish/postgres")

const expect = require("chai").expect
const knex = require("knex")
const proxyquire = require("proxyquire")
const database = require("../support/database")
const resultsFixture = require("../support/fixtures/results")

proxyquire.noCallThru()

const config = {
  postgres: database.connection,
  timezone: "US/Eastern",
}

const PostgresPublisher = proxyquire("../../src/publish/postgres", {
  "../config": config,
})

const databaseClient = knex({ client: "pg", connection: database.connection })

describe("PostgresPublisher", () => {
  describe(".publish(results)", () => {
    let results

    beforeEach(done => {
      results = Object.assign({}, resultsFixture)

      database.resetSchema().then(() => {
        done()
      }).catch(done)
    })

    it("should insert a record for each results.data element", done => {
      results.name = "report-name"
      results.data = [
        {
          date: "2017-02-11",
          name: "abc",
        },
        {
          date: "2017-02-12",
          name: "def",
        },
      ]

      PostgresPublisher.publish(results).then(() => {
        return databaseClient(ANALYTICS_DATA_TABLE_NAME).orderBy("date", "asc").select()
      }).then(rows => {
        expect(rows).to.have.length(2)
        rows.forEach((row, index) => {
          const data = results.data[index]
          expect(row.report_name).to.equal("report-name")
          expect(row.data.name).to.equal(data.name)
          expect(row.date.toISOString()).to.match(RegExp(`^${data.date}`))
        })
        done()
      }).catch(done)
    })

    it("should coerce certain values into numbers", done => {
      results.name = "report-name"
      results.data = [{
        date: "2017-05-15",
        name: "abc",
        visits: "123",
        total_events: "456",
      }]

      PostgresPublisher.publish(results).then(() => {
        return databaseClient.select().table(ANALYTICS_DATA_TABLE_NAME)
      }).then(rows => {
        const row = rows[0]
        expect(row.data.visits).to.be.a("number")
        expect(row.data.visits).to.equal(123)
        expect(row.data.total_events).to.be.a("number")
        expect(row.data.total_events).to.equal(456)
        done()
      }).catch(done)
    })

    it("should ignore reports that don't have a ga:date dimension", done => {
      results.query = { dimensions: "ga:something,ga:somethingElse" }

      PostgresPublisher.publish(results).then(() => {
        return databaseClient.select().table(ANALYTICS_DATA_TABLE_NAME)
      }).then(rows => {
        expect(rows).to.have.length(0)
        done()
      }).catch(done)
    })

    it("should ignore data points that have already been inserted", done => {
      firstResults = Object.assign({}, results)
      secondResults = Object.assign({}, results)

      firstResults.data = [
        {
          date: "2017-02-11",
          visits: "123",
          browser: "Chrome",
        },
        {
          date: "2017-02-11",
          visits: "456",
          browser: "Safari"
        },
      ]
      secondResults.data = [
        {
          date: "2017-02-11",
          visits: "456",
          browser: "Safari",
        },
        {
          date: "2017-02-11",
          visits: "789",
          browser: "Internet Explorer"
        },
      ]

      PostgresPublisher.publish(firstResults).then(() => {
        return PostgresPublisher.publish(secondResults)
      }).then(() => {
        return databaseClient.select().table(ANALYTICS_DATA_TABLE_NAME)
      }).then(rows => {
        expect(rows).to.have.length(3)
        done()
      }).catch(done)
    })

    it("should overwrite existing data points if the number of visits or users has changed", done => {
      firstResults = Object.assign({}, results)
      secondResults = Object.assign({}, results)

      firstResults.data = [
        {
          date: "2017-02-11",
          visits: "100",
          browser: "Safari",
        },
        {
          date: "2017-02-11",
          total_events: "300",
          title: "IRS Form 123",
        },
      ]
      secondResults.data = [
        {
          date: "2017-02-11",
          visits: "200",
          browser: "Safari",
        },
        {
          date: "2017-02-11",
          total_events: "400",
          title: "IRS Form 123",
        },
      ]

      PostgresPublisher.publish(firstResults).then(() => {
        return PostgresPublisher.publish(secondResults)
      }).then(() => {
        return databaseClient.select().table(ANALYTICS_DATA_TABLE_NAME)
      }).then(rows => {
        expect(rows).to.have.length(2)
        rows.forEach(row => {
          if (row.data.visits) {
            expect(row.data.visits).to.equal(200)
          } else {
            expect(row.data.total_events).to.equal(400)
          }
        })
        done()
      }).catch(done)
    })

    it("should not not insert a record if the date is invalid", done => {
      results.data = [
        {
          date: "(other)",
          visits: "123",
        },
        {
          date: "2017-02-16",
          visits: "456",
        },
      ]

      PostgresPublisher.publish(results).then(() => {
        return databaseClient.select().table(ANALYTICS_DATA_TABLE_NAME)
      }).then(rows => {
        expect(rows).to.have.length(1)
        expect(rows[0].data.visits).to.equal(456)
        done()
      }).catch(done)
    })
  })
})
