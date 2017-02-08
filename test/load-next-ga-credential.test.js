const expect = require("chai").expect
const proxyquire = require("proxyquire")

proxyquire.noCallThru()

const config = {}

const loadGoogleAnalyticsCredentials = proxyquire("../src/load-ga-credentials", {
  "./config": config,
})

describe(".loadGoogleAnalyticsCredentials", () => {
  beforeEach(() => {
    config.analytics_credentials = undefined
    global.analyticsCredentialsIndex = 0
  })

  it("should return the credentials if the credentials are an object", () => {
    config.analytics_credentials = `{
      "email": "email@example.com",
      "key": "this-is-a-secret"
    }`

    const creds = loadGoogleAnalyticsCredentials()
    expect(creds.email).to.equal("email@example.com")
    expect(creds.key).to.equal("this-is-a-secret")
  })

  it("should return successive credentials if the credentials are an array", () => {
    config.analytics_credentials = `[
      {
        "email": "email_1@example.com",
        "key": "this-is-a-secret-1"
      },
      {
        "email": "email_2@example.com",
        "key": "this-is-a-secret-2"
      }
    ]`

    const firstCreds = loadGoogleAnalyticsCredentials()
    const secondCreds = loadGoogleAnalyticsCredentials()
    const thirdCreds = loadGoogleAnalyticsCredentials()

    expect(firstCreds.email).to.equal("email_1@example.com")
    expect(firstCreds.key).to.equal("this-is-a-secret-1")
    expect(secondCreds.email).to.equal("email_2@example.com")
    expect(secondCreds.key).to.equal("this-is-a-secret-2")
    expect(thirdCreds.email).to.equal("email_1@example.com")
    expect(thirdCreds.key).to.equal("this-is-a-secret-1")
  })
})
