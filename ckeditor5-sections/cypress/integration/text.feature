Feature: Text editing

  Text elements can be edited and their content is immediately reflected in the preview.

  Scenario: Edit the text section
    Given I opened an empty document
#    And I click the first section
#    And I click the textfield "Enter some text ..."
#    And I enter "Test"
#    Then the preview should show "Test"
    Then there should be 1 text section
