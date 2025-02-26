const expect = require("chai").expect;
const timekeeper = require("timekeeper");
const reportFixture = require("../support/fixtures/report");
const GoogleAnalyticsQueryBuilder = require("../../src/google_analytics/query_builder");

const appConfig = {};

describe("GoogleAnalyticsQueryBuilder", () => {
  describe(".buildQueries(reportConfig, appConfig)", () => {
    let reportConfig;

    describe("when reportConfig.dateRange is set", () => {
      describe("when the current date is before October 1 of the year", () => {
        let actual;

        beforeEach(() => {
          reportConfig = Object.assign({}, reportFixture);
          delete reportConfig.query.dateRanges;
          reportConfig.dateRangeChunkSize = 4;
          reportConfig.dateRanges = [
            "yesterday",
            "7-days",
            "30-days",
            "90-days",
            "current-year",
            "current-fiscal-year",
            "previous-year",
            "previous-fiscal-year",
          ];

          appConfig.account = {
            ids: "ga:123456",
          };

          // February 19, 2025
          timekeeper.freeze(new Date(2025, 1, 19));
          actual = GoogleAnalyticsQueryBuilder.buildQueries(
            reportConfig,
            appConfig,
          );
          timekeeper.reset();
        });

        it("returns an array of queries with dateRanges set in groups based on the chunk size", () => {
          expect(actual).to.deep.equal([
            {
              ...reportConfig.query,
              ids: appConfig.account.ids,
              limit: "10000",
              property: `properties/${appConfig.account.ids}`,
              dateRanges: [
                {
                  endDate: "yesterday",
                  startDate: "yesterday",
                },
                {
                  endDate: "yesterday",
                  startDate: "7daysAgo",
                },
                {
                  endDate: "yesterday",
                  startDate: "30daysAgo",
                },
                {
                  endDate: "yesterday",
                  startDate: "90daysAgo",
                },
              ],
            },
            {
              ...reportConfig.query,
              ids: appConfig.account.ids,
              limit: "10000",
              property: `properties/${appConfig.account.ids}`,
              dateRanges: [
                {
                  endDate: "yesterday", // 2/18/2025
                  startDate: "49daysAgo", // 1/1/2025
                },
                {
                  endDate: "yesterday", // 2/18/2025
                  startDate: "141daysAgo", // 10/1/2024
                },
                {
                  endDate: "50daysAgo", // 12/31/2024
                  startDate: "415daysAgo", // 1/1/2024
                },
                {
                  endDate: "142daysAgo", // 9/30/2024
                  startDate: "507daysAgo", // 10/1/2023
                },
              ],
            },
          ]);
        });
      });

      describe("when the current date is after October 1 of the year", () => {
        let actual;

        beforeEach(() => {
          reportConfig = Object.assign({}, reportFixture);
          delete reportConfig.query.dateRanges;
          reportConfig.dateRangeChunkSize = 4;
          reportConfig.dateRanges = [
            "yesterday",
            "7-days",
            "30-days",
            "90-days",
            "current-year",
            "current-fiscal-year",
            "previous-year",
            "previous-fiscal-year",
          ];

          appConfig.account = {
            ids: "ga:123456",
          };

          // October 19, 2025
          timekeeper.freeze(new Date(2025, 9, 19));
          actual = GoogleAnalyticsQueryBuilder.buildQueries(
            reportConfig,
            appConfig,
          );
          timekeeper.reset();
        });

        it("returns an array of queries with dateRanges set in groups based on the chunk size", () => {
          expect(actual).to.deep.equal([
            {
              ...reportConfig.query,
              ids: appConfig.account.ids,
              limit: "10000",
              property: `properties/${appConfig.account.ids}`,
              dateRanges: [
                {
                  endDate: "yesterday",
                  startDate: "yesterday",
                },
                {
                  endDate: "yesterday",
                  startDate: "7daysAgo",
                },
                {
                  endDate: "yesterday",
                  startDate: "30daysAgo",
                },
                {
                  endDate: "yesterday",
                  startDate: "90daysAgo",
                },
              ],
            },
            {
              ...reportConfig.query,
              ids: appConfig.account.ids,
              limit: "10000",
              property: `properties/${appConfig.account.ids}`,
              dateRanges: [
                {
                  endDate: "yesterday", // 10/18/2025
                  startDate: "291daysAgo", // 1/1/2025
                },
                {
                  endDate: "yesterday", // 10/18/2025
                  startDate: "18daysAgo", // 10/1/2025
                },
                {
                  endDate: "292daysAgo", // 12/31/2024
                  startDate: "657daysAgo", // 1/1/2024
                },
                {
                  endDate: "19daysAgo", // 9/30/2025
                  startDate: "383daysAgo", // 10/1/2024
                },
              ],
            },
          ]);
        });
      });
    });

    describe("when reportConfig.dateRange not set", () => {
      beforeEach(() => {
        reportConfig = Object.assign({}, reportFixture);
        appConfig.account = {
          ids: "ga:123456",
        };
      });

      it("should set the properties from the query object on the report", () => {
        reportConfig.query = {
          a: "123abc",
          b: "456def",
        };

        const query = GoogleAnalyticsQueryBuilder.buildQueries(
          reportConfig,
          appConfig,
        );
        expect(query[0].a).to.equal("123abc");
        expect(query[0].b).to.equal("456def");
      });

      it("should set limit if it is set on the reportConfig", () => {
        reportConfig.query["limit"] = "3";

        const query = GoogleAnalyticsQueryBuilder.buildQueries(
          reportConfig,
          appConfig,
        );
        expect(query[0]["limit"]).to.equal("3");
      });

      it("should set limit to 10000 if it is unset on the reportConfig", () => {
        reportConfig.query["limit"] = undefined;

        const query = GoogleAnalyticsQueryBuilder.buildQueries(
          reportConfig,
          appConfig,
        );
        expect(query[0]["limit"]).to.equal("10000");
      });

      it("should set the ids to the account ids specified by the appConfig", () => {
        appConfig.account.ids = "ga:abc123";

        const query = GoogleAnalyticsQueryBuilder.buildQueries(
          reportConfig,
          appConfig,
        );
        expect(query[0].ids).to.equal("ga:abc123");
      });
    });
  });
});
