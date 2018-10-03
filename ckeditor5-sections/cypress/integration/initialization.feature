Feature: Editor initialization
  The editor can be initialized either empty or with predefined content.
  Clicking a section widget will bring up the toolbar.

  Scenario: Empty documents are initialized with a default section
    Given I opened an empty document
    Then there should be 1 text section

  Scenario: Non-empty documents are initialized correctly
    Given I opened a document with existing content
    Then the first preview section should show "Text 1"
    And the second preview section should show "Text 2"

  Scenario: Show the toolbar
    Given there is 1 section
    And I click the first section
    Then the section toolbar appears
