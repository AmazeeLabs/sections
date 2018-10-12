Feature: Automatic document correction

  Incorrect documents are automatically corrected. Missing elements are added and unexpected ones removed.

  Scenario: Unexpected element
    Given there is a text element with an unexpected h3 element
    Then the h3 element is removed

  Scenario: Missing element
    Given there is a text element missing the p element
    Then an empty p element is added

  Scenario: Wrong order
    Given there is a text element with element p before h2
    Then it is corrected to h2 before p

  Scenario: Unexpected, missing
    Given there is a text element with element h3 before p
    Then it is corrected to h2 before p
