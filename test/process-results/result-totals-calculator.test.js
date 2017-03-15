const expect = require("chai").expect
const proxyquire = require("proxyquire")
const reportFixture = require("../support/fixtures/report")
const dataFixture = require("../support/fixtures/data")
const ResultTotalsCalculator = require("../../src/process-results/result-totals-calculator")

proxyquire.noCallThru()

const GoogleAnalyticsDataProcessor = proxyquire("../../src/process-results/ga-data-processor", {
  "../config": { account: { hostname: "" } },
})

describe("ResultTotalsCalculator", () => {
  describe("calculateTotals(result)", () => {
    let report
    let data

    beforeEach(() => {
      report = Object.assign({}, reportFixture)
      data = Object.assign({}, dataFixture)
    })

    it("should compute totals for users", () => {
      data.columnHeaders = [{ name: "ga:users" }]
      data.rows = [["10"], ["15"], ["20"]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.users).to.equal(10 + 15 + 20)
    })

    it("should compute totals for visits", () => {
      data.columnHeaders = [{ name: "ga:sessions" }]
      data.rows = [["10"], ["15"], ["20"]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.visits).to.equal(10 + 15 + 20)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.device_models.iPhone).to.equal(100 + 300)
      expect(totals.device_models.Android).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.languages.en).to.equal(100 + 300)
      expect(totals.languages.es).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.devices.mobile).to.equal(100 + 400)
      expect(totals.devices.tablet).to.equal(200 + 500)
      expect(totals.devices.desktop).to.equal(300 + 600)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.screen_resolution["100x100"]).to.equal(100 + 300)
      expect(totals.screen_resolution["200x200"]).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.os["Nintendo Wii"]).to.equal(100 + 300)
      expect(totals.os["Xbox"]).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.os_version.Server).to.equal(100 + 300)
      expect(totals.os_version.Vista).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.browser.Chrome).to.equal(100 + 300)
      expect(totals.browser.Safari).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)
      expect(totals.ie_version["10.0"]).to.equal(100 + 300)
      expect(totals.ie_version["11.0"]).to.equal(200 + 400)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)

      expect(totals.by_os.Windows.Chrome).to.equal(100 + 500)
      expect(totals.by_os.Windows.Firefox).to.equal(200 + 600)

      expect(totals.by_browsers.Chrome.Windows).to.equal(100 + 500)
      expect(totals.by_browsers.Chrome.Linux).to.equal(300 + 700)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)

      expect(totals.by_windows.XP["10"]).to.equal(100 + 500)
      expect(totals.by_windows.XP["7"]).to.equal(200 + 600)

      expect(totals.by_ie["10"].XP).to.equal(100 + 500)
      expect(totals.by_ie["10"].Vista).to.equal(300 + 700)
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

      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      const totals = ResultTotalsCalculator.calculateTotals(result)

      expect(totals.by_windows.XP.Chrome).to.equal(100 + 500)
      expect(totals.by_windows.XP.Firefox).to.equal(200 + 600)

      expect(totals.by_browsers.Chrome.XP).to.equal(100 + 500)
      expect(totals.by_browsers.Chrome.Vista).to.equal(300 + 700)
    })
  })
})
