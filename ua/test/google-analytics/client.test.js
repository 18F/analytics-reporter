const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const googleAPIsMock = require("../support/mocks/googleapis-analytics");

proxyquire.noCallThru();

let googleapis;
let GoogleAnalyticsQueryAuthorizer;
let GoogleAnalyticsQueryBuilder;
let report;

let GoogleAnalyticsClient;

describe("UA GoogleAnalyticsClient", () => {
  describe(".fetchData(query, options)", () => {
    beforeEach(() => {
      googleapis = googleAPIsMock();
      const { analytics } = googleapis;
      GoogleAnalyticsQueryAuthorizer = {
        authorizeQuery: (query) => Promise.resolve(query),
      };
      GoogleAnalyticsQueryBuilder = { buildQuery: () => ({}) };

      GoogleAnalyticsClient = proxyquire("../../src/google-analytics/client", {
        googleapis: { google: { analytics } },
        "./query-authorizer": GoogleAnalyticsQueryAuthorizer,
        "./query-builder": GoogleAnalyticsQueryBuilder,
      });
    });

    it("should build and authorize a query and use that to call the google api", (done) => {
      const report = { name: "realtime" };

      let queryBuilderCalled = false;
      GoogleAnalyticsQueryBuilder.buildQuery = (report) => {
        expect(report).to.deep.equal({ name: "realtime" });
        queryBuilderCalled = true;
        return { query: true };
      };

      let queryAuthorizerCalled = false;
      GoogleAnalyticsQueryAuthorizer.authorizeQuery = (query) => {
        queryAuthorizerCalled = true;
        expect(query).to.deep.equal({ query: true });
        query.authorized = true;
        return Promise.resolve(query);
      };

      let googleAPICalled = false;
      googleapis.ga.get = (params) => {
        googleAPICalled = true;
        expect(params).to.deep.equal({ query: true, authorized: true });
      };

      GoogleAnalyticsClient.fetchData(report)
        .then(() => {
          expect(queryBuilderCalled).to.be.true;
          expect(queryAuthorizerCalled).to.be.true;
          expect(googleAPICalled).to.be.true;
          done();
        })
        .catch(done);
    });

    it("should return a promise for Google Analytics data", (done) => {
      googleapis.ga.get = (params, cb) => {
        return { data: "that's me" };
      };

      GoogleAnalyticsClient.fetchData({})
        .then((result) => {
          expect(result).to.deep.equal({ data: "that's me" });
          done();
        })
        .catch(done);
    });

    it("should reject if there is a problem fetching data", (done) => {
      googleapis.ga.get = (params) => {
        const error = new Error("i'm an error");
        throw error;
      };

      GoogleAnalyticsClient.fetchData({})
        .catch((error) => {
          expect(error.message).to.equal("i'm an error");
          done();
        })
        .catch(done);
    });
  });
});
