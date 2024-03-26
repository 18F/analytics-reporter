const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const googleAPIsMock = require("../support/mocks/googleapis-auth");

proxyquire.noCallThru();

const config = {};
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
      config.email = "hello@example.com";
      config.key = "123abc";
      config.key_file = undefined;
    });

    it("should resolve a query with the auth prop set to an authorized JWT", (done) => {
      subject
        .authorizeQuery(query, config)
        .then((query) => {
          expect(query.abc).to.equal(123);
          expect(query.auth).to.not.be.undefined;
          expect(query.auth).to.be.an.instanceof(googleapis.Auth.JWT);
          done();
        })
        .catch(done);
    });

    it("should create a JWT with the proper scopes", (done) => {
      subject
        .authorizeQuery({}, config)
        .then((query) => {
          expect(query.auth.initArguments[3]).to.deep.equal([
            "https://www.googleapis.com/auth/analytics.readonly",
          ]);
          done();
        })
        .catch(done);
    });

    it("should authorize the JWT and resolve if it is valid", (done) => {
      let jwtAuthorized = false;
      googleapis.Auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true;
        callback(null, {});
      };

      subject
        .authorizeQuery({}, config)
        .then(() => {
          expect(jwtAuthorized).to.equal(true);
          done();
        })
        .catch(done);
    });

    it("should authorize the JWT and reject if it is invalid", (done) => {
      let jwtAuthorized = false;
      googleapis.Auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true;
        callback(new Error("Failed to authorize"));
      };

      subject
        .authorizeQuery({}, config)
        .catch((err) => {
          expect(jwtAuthorized).to.equal(true);
          expect(err.message).to.equal("Failed to authorize");
          done();
        })
        .catch(done);
    });
  });
});
