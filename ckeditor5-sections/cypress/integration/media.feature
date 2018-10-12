Feature: Embedded media

  Media objects can be embedded and display a preview.

  Scenario: Add an empty image element
    Given I opened an empty document
    And I click the first element
    And I click the "Insert element below" container button
    And I click the "Insert ..." toolbar button
    And I click the "Image" toolbar button
    Then there should be 1 image element

  Scenario: Toolbar on images
    Given there is an empty image element
    And I click the first element
    Then the container control buttons appear

  Scenario: Select an image
    Given there is an empty image element
    And I click the first element
    And I click the "Select media" image button
    And I wait for the media loading indicator to disappear
    Then I should see an image preview
    And the preview contains a media entity

  Scenario: Add an image
    Given there is an empty image element
    And I click the first element
    And I click the "Add media" image button
    And I wait for the media loading indicator to disappear
    Then I should see an image preview
    And the preview contains a media entity

  Scenario: Existing image element
    Given there is an image element
    Then I should see an image preview
    And the preview contains a media entity
