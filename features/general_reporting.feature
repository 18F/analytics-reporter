Feature: Test some general reporting features

  Background:
    Given I set analytics-reporter to write reports to disk

  @uuid-9a717cea-839b-446d-afce-355376f26a8a
  Scenario: Running a report returns an object with the expected fields
    Given I set analytics-reporter to run the "os" report
    When I run the analytics-reporter application
    Then the "os" report should exist in the output directory
    And the report should have the expected analytics fields

  @uuid-c881de9a-cbb8-4f0a-b43b-70e460623de4
  Scenario: Running a report with additional totals has the expected totals
    Given I set analytics-reporter to run the "devices" report
    When I run the analytics-reporter application
    Then the "devices" report should exist in the output directory
    And the report should have the expected analytics fields
    And the "devices" report should have totals for:
      | key       |
      | visits    |
      | by_device |

  @uuid-149ddbba-9ba5-4ca7-8efc-273f59395eeb
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

  @uuid-473bc3a8-fbd9-407e-a685-a8ce5cdc66b2
  Scenario: Running a slim report removes the data key
    Given I set analytics-reporter to run the "devices" report
    And I set analytics-reporter to write slim reports
    When I run the analytics-reporter application
    Then the "devices" report should exist in the output directory
    And the report should have the expected analytics fields
    And the "devices" report should not have key "data"

  @uuid-39f06bcf-a5c6-4f94-911a-57fcc31650ea
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

  @uuid-a531ebe8-9deb-445b-98b9-01ee2eac69e1
  Scenario: Running analytics-reporter for the frequency "hourly" runs the expected reports
    Given I set analytics-reporter to run reports with frequency "hourly"
    When I run the analytics-reporter application
    Then the following reports should exist in the output directory:
      | reportName |
      | today      |
    And the report should have the expected analytics fields

  @uuid-2df44660-e9ce-486c-b850-e6c2f3bd40ff
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


