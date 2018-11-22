Feature: Text editing

  Text elements can be edited and their content is immediately reflected in the preview.

  Scenario: Edit the text section
    Given I opened an empty document
    And I click the first element
    And I edit the textarea "Enter your text ..."
    And I enter "Test"
    Then the preview should show "Test"

  Scenario: See how many characters are left
    Given I opened an empty document
    And I click the first element
    And I edit the textarea "Enter your text ..."
    And I enter "Testing the limit"
    Then the remaining characters counter should show 14

  Scenario: The character counter is not highlighted initially
    Given I opened an empty document
    And I click the first element
    And I edit the textarea "Enter your text ..."
    Then the remaining characters counter should not be highlighted

  Scenario: The character counter is highlighted when the limit is exceeded
    Given I opened an empty document
    And I click the first element
    And I edit the textarea "Enter your text ..."
    And I enter "A long text that surely will leave the limit behind"
    Then the remaining characters counter should be highlighted
