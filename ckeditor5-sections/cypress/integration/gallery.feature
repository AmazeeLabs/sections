Feature: Container example - Image gallery
  Scenario: Empty image gallery
    Given there is an empty image gallery
    And I click the first image
    And I click the next page control
    And I click the "Image" toolbar button
    Then there should be 2 elements
