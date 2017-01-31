const expect = require("chai").expect
const proxyquire = require("proxyquire")
const reportFixture = require("./fixtures/report")
const dataFixture = require("./fixtures/data")

proxyquire.noCallThru()

let config = {}

const processGoogleAnalyticsData = proxyquire("../src/process-ga-data", {
  "./config": config,
})

describe("processGoogleAnalyticsData(report, data)", () => {
  let report
  let data

  beforeEach(() => {
    report = Object.assign({}, reportFixture)
    data = Object.assign({}, dataFixture)
    config.account = {
      hostname: ""
    }
  })

  it("should return results with the correct props", () => {
    const result = processGoogleAnalyticsData(report, data)
    expect(result.name).to.be.a("string")
    expect(result.query).be.an("object")
    expect(result.meta).be.an("object")
    expect(result.data).be.an("array")
    expect(result.totals).be.an("object")
    expect(result.totals).be.an("object")
    expect(result.taken_at).be.a("date")
  })

  it("should return results with an empty data array if data is undefined or has no rows", () => {
    data.rows = []
    expect(processGoogleAnalyticsData(report, data).data).to.be.empty
    data.rows = undefined
    expect(processGoogleAnalyticsData(report, data).data).to.be.empty
  })

  it("should delete the query ids for the GA response", () => {
    const result = processGoogleAnalyticsData(report, data)
    expect(result.query).to.not.have.property("ids")
  })

  it("should map data from GA keys to DAP keys", () => {
    data.columnHeaders = [
      { name: "ga:date" }, { name: "ga:browser"}, { name: "ga:city" }
    ]
    data.rows = [["20170130", "chrome", "Baton Rouge, La"]]

    const result = processGoogleAnalyticsData(report, data)
    expect(Object.keys(result.data[0])).to.deep.equal(["date", "browser", "city"])
  })

  it("should format dates", () => {
    data.columnHeaders = [{ name: 'ga:date' }]
    data.rows = [[ "20170130" ]]

    const result = processGoogleAnalyticsData(report, data)
    expect(result.data[0].date).to.equal("2017-01-30")
  })

  it("should filter rows that don't meet the threshold if a threshold is provided", () => {
    report.threshold = {
      field: "unmapped_column",
      value: "10",
    }
    data.columnHeaders = [{ name: "unmapped_column" }]
    data.rows = [[20], [5], [15]]

    const result = processGoogleAnalyticsData(report, data)
    expect(result.data).to.have.length(2)
    expect(result.data.map(row => row.unmapped_column)).to.deep.equal([20, 15])
  })

  it("should remove dimensions that are specified by the cut prop", () => {
    report.cut = "unmapped_column"
    data.columnHeaders = [{ name: "ga:hostname" }, { name: "unmapped_column" }]
    data.rows = [["www.example.gov", 10000000]]

    const result = processGoogleAnalyticsData(report, data)
    expect(result.data[0].unmapped_column).to.be.undefined
  })

  it("should add a hostname to realtime data if a hostname is specified by the config", () => {
    report.realtime = true
    config.account.hostname = "www.example.gov"

    const result = processGoogleAnalyticsData(report, data)
    expect(result.data[0].domain).to.equal("www.example.gov")
  })

  describe("computing totals", () => {
    it("should compute totals for users", () => {
      data.columnHeaders = [{ name: "ga:users" }]
      data.rows = [["10"], ["15"], ["20"]]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.users).to.equal(10 + 15 + 20)
    })

    it("should compute totals for visits", () => {
      data.columnHeaders = [{ name: "ga:sessions" }]
      data.rows = [["10"], ["15"], ["20"]]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.visits).to.equal(10 + 15 + 20)
    })

    it("should compute totals for device_models", () => {
      report.name = "device_model"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:mobileDeviceModel" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "iPhone", "100"],
        ["20170130", "Android", "200"],
        ["20170131", "iPhone", "300"],
        ["20170131", "Android", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.device_models.iPhone).to.equal(100 + 300)
      expect(result.totals.device_models.Android).to.equal(200 + 400)
    })

    it("should compute totals for languages", () => {
      report.name = "language"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:language" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "en", "100"],
        ["20170130", "es", "200"],
        ["20170131", "en", "300"],
        ["20170131", "es", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.languages.en).to.equal(100 + 300)
      expect(result.totals.languages.es).to.equal(200 + 400)
    })

    it("should compute totals for devices", () => {
      report.name = "devices"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:deviceCategory" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "mobile", "100"],
        ["20170130", "tablet", "200"],
        ["20170130", "desktop", "300"],
        ["20170131", "mobile", "400"],
        ["20170131", "tablet", "500"],
        ["20170131", "desktop", "600"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.devices.mobile).to.equal(100 + 400)
      expect(result.totals.devices.tablet).to.equal(200 + 500)
      expect(result.totals.devices.desktop).to.equal(300 + 600)
    })

    it("should compute totals for screen-sizes", () => {
      report.name = "screen-size"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:screenResolution" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "100x100", "100"],
        ["20170130", "200x200", "200"],
        ["20170131", "100x100", "300"],
        ["20170131", "200x200", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.screen_resolution["100x100"]).to.equal(100 + 300)
      expect(result.totals.screen_resolution["200x200"]).to.equal(200 + 400)
    })

    it("should compute totals for os", () => {
      report.name = "os"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:operatingSystem" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "Nintendo Wii", "100"],
        ["20170130", "Xbox", "200"],
        ["20170131", "Nintendo Wii", "300"],
        ["20170131", "Xbox", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.os["Nintendo Wii"]).to.equal(100 + 300)
      expect(result.totals.os["Xbox"]).to.equal(200 + 400)
    })

    it("should compute totals for windows", () => {
      report.name = "windows"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:operatingSystemVersion" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "Server", "100"],
        ["20170130", "Vista", "200"],
        ["20170131", "Server", "300"],
        ["20170131", "Vista", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.os_version.Server).to.equal(100 + 300)
      expect(result.totals.os_version.Vista).to.equal(200 + 400)
    })

    it("should compute totals for browsers", () => {
      report.name = "browsers"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:browser" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "Chrome", "100"],
        ["20170130", "Safari", "200"],
        ["20170131", "Chrome", "300"],
        ["20170131", "Safari", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.browser.Chrome).to.equal(100 + 300)
      expect(result.totals.browser.Safari).to.equal(200 + 400)
    })

    it("should compute totals for ie", () => {
      report.name = "ie"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:browserVersion" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "10.0", "100"],
        ["20170130", "11.0", "200"],
        ["20170131", "10.0", "300"],
        ["20170131", "11.0", "400"],
      ]

      const result = processGoogleAnalyticsData(report, data)
      expect(result.totals.ie_version["10.0"]).to.equal(100 + 300)
      expect(result.totals.ie_version["11.0"]).to.equal(200 + 400)
    })

    it("should compute totals for os-browsers by operating system and browser", () => {
      report.name = "os-browsers"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:operatingSystem" },
        { name: "ga:browser" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "Windows", "Chrome", "100"],
        ["20170130", "Windows", "Firefox", "200"],
        ["20170130", "Linux", "Chrome", "300"],
        ["20170130", "Linux", "Firefox", "400"],
        ["20170130", "Windows", "Chrome", "500"],
        ["20170130", "Windows", "Firefox", "600"],
        ["20170130", "Linux", "Chrome", "700"],
        ["20170130", "Linux", "Firefox", "800"],
      ]

      const result = processGoogleAnalyticsData(report, data)

      expect(result.totals.by_os.Windows.Chrome).to.equal(100 + 500)
      expect(result.totals.by_os.Windows.Firefox).to.equal(200 + 600)

      expect(result.totals.by_browsers.Chrome.Windows).to.equal(100 + 500)
      expect(result.totals.by_browsers.Chrome.Linux).to.equal(300 + 700)
    })

    it("should compute totals for windows-ie by Windows version and IE version", () => {
      report.name = "windows-ie"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:operatingSystemVersion" },
        { name: "ga:browserVersion" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "XP", "10", "100"],
        ["20170130", "XP", "7", "200"],
        ["20170130", "Vista", "10", "300"],
        ["20170130", "Vista", "7", "400"],
        ["20170130", "XP", "10", "500"],
        ["20170130", "XP", "7", "600"],
        ["20170130", "Vista", "10", "700"],
        ["20170130", "Vista", "7", "800"],
      ]

      const result = processGoogleAnalyticsData(report, data)

      expect(result.totals.by_windows.XP["10"]).to.equal(100 + 500)
      expect(result.totals.by_windows.XP["7"]).to.equal(200 + 600)

      expect(result.totals.by_ie["10"].XP).to.equal(100 + 500)
      expect(result.totals.by_ie["10"].Vista).to.equal(300 + 700)
    })

    it("should compute totals for windows-browsers by windows version and browser version", () => {
      report.name = "windows-browsers"
      data.columnHeaders = [
        { name: "ga:date" },
        { name: "ga:operatingSystemVersion" },
        { name: "ga:browser" },
        { name: "ga:sessions" },
      ]
      data.rows = [
        ["20170130", "XP", "Chrome", "100"],
        ["20170130", "XP", "Firefox", "200"],
        ["20170130", "Vista", "Chrome", "300"],
        ["20170130", "Vista", "Firefox", "400"],
        ["20170130", "XP", "Chrome", "500"],
        ["20170130", "XP", "Firefox", "600"],
        ["20170130", "Vista", "Chrome", "700"],
        ["20170130", "Vista", "Firefox", "800"],
      ]

      const result = processGoogleAnalyticsData(report, data)

      expect(result.totals.by_windows.XP.Chrome).to.equal(100 + 500)
      expect(result.totals.by_windows.XP.Firefox).to.equal(200 + 600)

      expect(result.totals.by_browsers.Chrome.XP).to.equal(100 + 500)
      expect(result.totals.by_browsers.Chrome.Vista).to.equal(300 + 700)
    })
  })
})
