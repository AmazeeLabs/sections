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

  Scenario: Preselect existing values in a dropdown
    Given I opened an empty document
    When I click the first element
    And I click the configure control
    Then "Option A" should be preselected

  Scenario: Change a setting in a dropdown
    Given I opened an empty document
    And I click the first element
    When I click the configure control
    And I choose "Option B" for the first setting
    Then "Option B" remains selected
    And the first preview element has "first" set to "b"

  Scenario: Preselect values in a textfield
    Given I opened an empty document
    When I click the first element
    And I click the configure control
    Then a textfield element should have a value of "initial value"

  Scenario: Preserve user input in a textfield
    Given I opened an empty document
    And I added an Image element
    When I type "Test value" into a configuration textfield of the first element
    And I click the second element
    And I open the configuration panel of the first element
    Then a textfield element should have a value of "Test value"

  Scenario: Preselect values in a multiselect
    Given I opened an empty document
    When I click the first element
    And I click the configure control
    Then a multiselect element should have a value of "One, Three"

  Scenario: Preserve user input in a textfield
    Given I opened an empty document
    And I added an Image element
    When I select "Two" in a multiselect field of the first element
    And I click the second element
    And I open the configuration panel of the first element
    Then a multiselect element should have a value of "One, Two, Three"