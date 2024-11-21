const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const googleAPIsMock = require("../support/mocks/googleapis-auth");

proxyquire.noCallThru();

const appConfig = {};
const googleapis = {};
const GoogleAnalyticsCredentialLoader = {
  getCredentials: () => ({
    email: "next_email@example.com",
    key: "Shhh, this is the next secret",
  }),
};

const GoogleAnalyticsQueryAuthorizer = proxyquire(
  "../../src/google_analytics/query_authorizer",
  {
    "./credential_loader": GoogleAnalyticsCredentialLoader,
    googleapis,
  },
);

describe("GoogleAnalyticsQueryAuthorizer", () => {
  const subject = GoogleAnalyticsQueryAuthorizer;
  let query;

  beforeEach(() => {
    query = {
      abc: 123,
    };
  });

  describe(".authorizeQuery(query)", () => {
    beforeEach(() => {
      Object.assign(googleapis, googleAPIsMock());
      appConfig.email = "hello@example.com";
      appConfig.key = "123abc";
      appConfig.key_file = undefined;
    });

    it("should resolve a query with the auth prop set to an authorized JWT", async () => {
      await subject.authorizeQuery(query, appConfig).then((query) => {
        expect(query.abc).to.equal(123);
        expect(query.auth).to.not.be.undefined;
        expect(query.auth).to.be.an.instanceof(googleapis.Auth.JWT);
      });
    });

    it("should create a JWT with the proper scopes", async () => {
      await subject.authorizeQuery({}, appConfig).then((query) => {
        expect(query.auth.initArguments[3]).to.deep.equal([
          "https://www.googleapis.com/auth/analytics.readonly",
        ]);
      });
    });

    it("should authorize the JWT and resolve if it is valid", async () => {
      let jwtAuthorized = false;
      googleapis.Auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true;
        callback(null, {});
      };

      await subject.authorizeQuery({}, appConfig).then(() => {
        expect(jwtAuthorized).to.equal(true);
      });
    });

    it("should authorize the JWT and reject if it is invalid", async () => {
      let jwtAuthorized = false;
      googleapis.Auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true;
        callback(new Error("Failed to authorize"));
      };

      await subject.authorizeQuery({}, appConfig).catch((err) => {
        expect(jwtAuthorized).to.equal(true);
        expect(err.message).to.equal("Failed to authorize");
      });
    });
  });
});
