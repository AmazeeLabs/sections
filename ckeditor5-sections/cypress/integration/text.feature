Feature: Text editing

  Text elements can be edited and their content is immediately reflected in the preview.

  Scenario: Edit the text section
    Given I opened an empty document
    And I click the first element
    And I edit the textarea "Enter your text ..."
    And I enter "Test"
    Then the preview should show "Test"
