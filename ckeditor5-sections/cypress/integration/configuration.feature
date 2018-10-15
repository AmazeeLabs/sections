Feature: Configurable elements

  Scenario: Display the configuration button
    Given I opened an empty document
    And I click the first element
    Then there should be a configuration button

  Scenario: Don't display the configuration button
    Given I opened an empty document
    And I added an Image element
    When I click the second element
    Then there should be no configuration button

  Scenario: Preselect existing values
    Given I opened an empty document
    When I click the first element
    And I click the "Configure element" container button
    Then "Option A" should be preselected

  Scenario: Change a setting
    Given I opened an empty document
    And I click the first element
    When I click the "Configure element" container button
    And I choose "Option B" for the first setting
    Then "Option B" remains selected
    And the first preview element has "first" set to "b"


