Feature: Container elements
  Scenario: Gallery is initialised with one image
    Given there is an empty gallery
    Then there should be an empty image

  Scenario: Restricted insert items
    Given there is an empty gallery
    And I click the first gallery image
    And I click the "Insert ..." toolbar button
    Then the "Image" toolbar button should be enabled
    And the "Root" toolbar button should be disabled
    And the "Text" toolbar button should be disabled
    And the "Gallery" toolbar button should be disabled

