const expect = require("chai").expect;
const knex = require("knex");
const database = require("../support/database");
const resultsFixture = require("../support/fixtures/results");
const PostgresPublisher = require("../../src/publish/postgres");

describe("PostgresPublisher", () => {
  let knexInstance, results, subject;

  before(async () => {
    process.env.NODE_ENV = "test";
    // Setup the database client
    knexInstance = await knex({
      client: "pg",
      connection: database.connection,
    });
  });

  after(async () => {
    // Clean up the database client
    await knexInstance.destroy();
  });

  beforeEach(async () => {
    results = Object.assign({}, resultsFixture);
    subject = new PostgresPublisher(knexInstance);
    await database.resetSchema(knexInstance);
  });

  describe(".publish(results)", () => {
    it("should insert a record for each results.data element", async () => {
      results.name = "report-name";
      results.data = [
        {
          date: "2017-02-11",
          name: "abc",
        },
        {
          date: "2017-02-12",
          name: "def",
        },
      ];

      await subject
        .publish(results)
        .then(() => {
          return knexInstance(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME)
            .orderBy("date", "asc")
            .select();
        })
        .then((rows) => {
          expect(rows).to.have.length(2);
          rows.forEach((row, index) => {
            const data = results.data[index];
            expect(row.report_name).to.equal("report-name");
            expect(row.data.name).to.equal(data.name);
            expect(row.date.toISOString()).to.match(RegExp(`^${data.date}`));
          });
        });
    });

    it("should coerce certain values into numbers", async () => {
      results.name = "report-name";
      results.data = [
        {
          date: "2017-05-15",
          name: "abc",
          visits: "123",
          total_events: "456",
        },
      ];

      await subject
        .publish(results)
        .then(() => {
          return knexInstance
            .select()
            .table(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME);
        })
        .then((rows) => {
          const row = rows[0];
          expect(row.data.visits).to.be.a("number");
          expect(row.data.visits).to.equal(123);
          expect(row.data.total_events).to.be.a("number");
          expect(row.data.total_events).to.equal(456);
        });
    });

    it("should ignore reports that don't have a date dimension", async () => {
      results.query = {
        dimensions: [{ name: "something" }, { name: "somethingElse" }],
      };

      subject
        .publish(results)
        .then(() => {
          return knexInstance
            .select()
            .table(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME);
        })
        .then((rows) => {
          expect(rows).to.have.length(0);
        });
    });

    it("should ignore data points that have already been inserted", async () => {
      const firstResults = Object.assign({}, results);
      const secondResults = Object.assign({}, results);

      firstResults.data = [
        {
          date: "2017-02-11",
          visits: "123",
          browser: "Chrome",
        },
        {
          date: "2017-02-11",
          visits: "456",
          browser: "Safari",
        },
        {
          date: "2017-02-11",
          visits: "789",
          browser: "Fake string' with apostrophe",
        },
        {
          date: "2017-02-11",
          visits: "234",
          browser: 'Fake string with "double" quote',
        },
        {
          date: "2017-02-11",
          visits: "910",
          browser: "Fake string? with question mark",
        },
      ];
      secondResults.data = [
        {
          date: "2017-02-11",
          visits: "456",
          browser: "Safari",
        },
        {
          date: "2017-02-11",
          visits: "789",
          browser: "Internet Explorer",
        },
        {
          date: "2017-02-11",
          visits: "789",
          browser: "Fake string' with apostrophe",
        },
        {
          date: "2017-02-11",
          visits: "234",
          browser: 'Fake string with "double" quote',
        },
        {
          date: "2017-02-11",
          visits: "910",
          browser: "Fake string? with question mark",
        },
      ];

      await subject
        .publish(firstResults)
        .then(() => {
          return subject.publish(secondResults);
        })
        .then(() => {
          return knexInstance
            .select()
            .table(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME);
        })
        .then((rows) => {
          expect(rows).to.have.length(6);
        });
    });

    it("should overwrite existing data points if the number of visits or users has changed", async () => {
      const firstResults = Object.assign({}, results);
      const secondResults = Object.assign({}, results);

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
      ];
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
      ];

      await subject
        .publish(firstResults)
        .then(() => {
          return subject.publish(secondResults);
        })
        .then(() => {
          return knexInstance
            .select()
            .table(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME);
        })
        .then((rows) => {
          expect(rows).to.have.length(2);
          rows.forEach((row) => {
            if (row.data.visits) {
              expect(row.data.visits).to.equal(200);
            } else {
              expect(row.data.total_events).to.equal(400);
            }
          });
        });
    });

    it("should not not insert a record if the date is invalid", async () => {
      results.data = [
        {
          date: "(other)",
          visits: "123",
        },
        {
          date: "2017-02-16",
          visits: "456",
        },
      ];

      await subject
        .publish(results)
        .then(() => {
          return knexInstance
            .select()
            .table(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME);
        })
        .then((rows) => {
          expect(rows).to.have.length(1);
          expect(rows[0].data.visits).to.equal(456);
        });
    });
  });
});
