const expect = require("chai").expect
const proxyquire = require("proxyquire")
const googleAPIsMock = require("../support/mocks/googleapis-auth")

proxyquire.noCallThru()

const config = {}
const googleapis = {}
const GoogleAnalyticsCredentialLoader = {
  loadCredentials: () => ({
    email: "next_email@example.com",
    key: "Shhh, this is the next secret",
  })
}

const GoogleAnalyticsQueryAuthorizer = proxyquire("../../src/google-analytics/query-authorizer", {
  "../config": config,
  "./credential-loader": GoogleAnalyticsCredentialLoader,
  googleapis,
})

describe("GoogleAnalyticsQueryAuthorizer", () => {
  describe(".authorizeQuery(query)", () => {
    beforeEach(() => {
      Object.assign(googleapis, googleAPIsMock())
      config.email = "hello@example.com"
      config.key = "123abc"
      config.key_file = undefined
    })

    it("should resolve a query with the auth prop set to an authorized JWT", done => {
      query = {
        "abc": 123
      }

      GoogleAnalyticsQueryAuthorizer.authorizeQuery(query).then(query => {
        expect(query.abc).to.equal(123)
        expect(query.auth).to.not.be.undefined
        expect(query.auth).to.be.an.instanceof(googleapis.auth.JWT)
        done()
      }).catch(done)
    })

    it("should create a JWT with the key and email in the config if one exists", done => {
      config.email = "test@example.com"
      config.key = "Shh, this is a secret"

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(query.auth.initArguments[0]).to.equal("test@example.com")
        expect(query.auth.initArguments[2]).to.equal("Shh, this is a secret")
        done()
      }).catch(done)
    })

    it("should create a JWT from the keyfile and the email in the config if one exists", done => {
      config.email = "test@example.com"
      config.key = undefined
      config.key_file = "./test/support/fixtures/secret_key.pem"

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(query.auth.initArguments[0]).to.equal("test@example.com")
        expect(query.auth.initArguments[2]).to.equal("pem-key-file-not-actually-a-secret-key")
        done()
      }).catch(done)
    })

    it("should create a JWT from the JSON keyfile in the config if one exists", done => {
      config.key = undefined
      config.key_file = "./test/support/fixtures/secret_key.json"

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(query.auth.initArguments[0]).to.equal("json_test_email@example.com")
        expect(query.auth.initArguments[2]).to.equal("json-key-file-not-actually-a-secret-key")
        done()
      }).catch(done)
    })

    it("should create a JWT with credentials from calling GoogleAnalyticsCredentialLoader for analytics credentials in the config", done => {
      config.key = undefined
      config.analytics_credentials = "[{}]" // overriden by proxyquire

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(query.auth.initArguments[0]).to.equal("next_email@example.com")
        expect(query.auth.initArguments[2]).to.equal("Shhh, this is the next secret")
        done()
      }).catch(done)
    })

    it("should create a JWT with the proper scopes", done => {
      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(query.auth.initArguments[3]).to.deep.equal([
          "https://www.googleapis.com/auth/analytics.readonly"
        ])
        done()
      }).catch(done)
    })

    it("should authorize the JWT and resolve if it is valid", done => {
      let jwtAuthorized = false
      googleapis.auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true
        callback(null, {})
      }

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).then(query => {
        expect(jwtAuthorized).to.equal(true)
        done()
      }).catch(done)
    })

    it("should authorize the JWT and reject if it is invalid", done => {
      let jwtAuthorized = false
      googleapis.auth.JWT.prototype.authorize = (callback) => {
        jwtAuthorized = true
        callback(new Error("Failed to authorize"))
      }

      GoogleAnalyticsQueryAuthorizer.authorizeQuery({}).catch(err => {
        expect(jwtAuthorized).to.equal(true)
        expect(err.message).to.equal("Failed to authorize")
        done()
      }).catch(done)
    })
  })
})
