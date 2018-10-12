Feature: Editor initialization
  The editor can be initialized either empty or with predefined content.
  Clicking a element widget will bring up the toolbar.

  Scenario: Empty documents are initialized with a default element
    Given I opened an empty document
    Then there should be 1 text element

  Scenario: Non-empty documents are initialized correctly
    Given I opened a document with existing content
    Then the first preview element should show "Text 1"
    And the second preview element should show "Text 2"
