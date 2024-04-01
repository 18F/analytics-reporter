Feature: Test some general reporting features

  Background:
    Given I set analytics-reporter to write reports to disk

  Scenario: Running a report returns an object with the expected fields
    Given I set analytics-reporter to run the "os" report
    When I run the analytics-reporter application
    Then the "os" report should exist in the output directory
    And the report should have the expected analytics fields

  Scenario: Running a report with additional totals has the expected totals
    Given I set analytics-reporter to run the "devices" report
    When I run the analytics-reporter application
    Then the "devices" report should exist in the output directory
    And the report should have the expected analytics fields
    And the "devices" report should have totals for:
      | key       |
      | visits    |
      | by_device |

  Scenario: Running a report with multiple total columns has the expected totals
    Given I set analytics-reporter to run the "language" report
    When I run the analytics-reporter application
    Then the "language" report should exist in the output directory
    And the report should have the expected analytics fields
    And the "language" report should have totals for:
      | key              |
      | visits           |
      | by_language      |
      | by_language_code |

  Scenario: Running a slim report removes the data key
    Given I set analytics-reporter to run the "devices" report
    And I set analytics-reporter to write slim reports
    When I run the analytics-reporter application
    Then the "devices" report should exist in the output directory
    And the report should have the expected analytics fields
    And the "devices" report should not have key "data"

  Scenario: Running analytics-reporter for the frequency "daily" runs the expected reports
    Given I set analytics-reporter to run reports with frequency "daily"
    When I run the analytics-reporter application with extended timeout
    Then the following reports should exist in the output directory:
      | reportName                        |
      | screen-size                       |
      | language                          |
      | devices                           |
      | devices-90-days                   |
      | device-model                      |
      | os                                |
      | os-90-days                        |
      | windows                           |
      | windows-90-days                   |
      | browsers                          |
      | browsers-90-days                  |
      | os-browsers                       |
      | windows-browsers                  |
      | top-domains-7-days                |
      | top-domains-30-days               |
      | top-landing-pages-30-days         |
      | top-traffic-sources-30-days       |
      | top-session-channel-group-30-days |
      | top-session-source-medium-30-days |
      | engagement-rate-30-days           |
      | engagement-duration-30-days       |
      | second-level-domains              |
      | sites                             |
      | sites-extended                    |
      | top-pages-30-days                 |
      | top-pages-7-days                  |
      | top-downloads-yesterday           |
      | top-downloads-7-days              |
      | top-10000-domains-30-days         |
      | users                             |
      | sessions-over-30-days             |
    And the reports should have the expected analytics fields

  Scenario: Running analytics-reporter for the frequency "hourly" runs the expected reports
    Given I set analytics-reporter to run reports with frequency "hourly"
    When I run the analytics-reporter application
    Then the following reports should exist in the output directory:
      | reportName |
      | today      |
    And the report should have the expected analytics fields

  Scenario: Running analytics-reporter for the frequency "realtime" runs the expected reports
    Given I set analytics-reporter to run reports with frequency "realtime"
    When I run the analytics-reporter application with extended timeout
    Then the following reports should exist in the output directory:
      | reportName             |
      | realtime               |
      | top-pages-realtime     |
      | top-cities-realtime    |
      | top-countries-realtime |
      | all-pages-realtime     |
      | last-48-hours          |
    And the reports should have the expected analytics fields


