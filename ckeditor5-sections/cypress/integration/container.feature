Feature: Containers

  Containers allow to arrange add/remove and arrange sections.

  Scenario: Prevent removal of the last section
    Given there is 1 section
    And I click the first section
    Then the "Remove section" toolbar button should be disabled

  Scenario: Prevent nesting root containers
    Given I opened an empty document
    And I click the first section
    And I click the "Insert" toolbar button
    Then the "Root" toolbar button should be hidden

  Scenario: Add a section
    Given there is 1 section
    And I click the first section
    And I click the "Insert ..." toolbar button
    And I click the "Text" toolbar button
    Then there should be 2 text sections

  Scenario: A single section can't be moved
    Given there is 1 section
    And I click the first section
    Then the "Move section up" toolbar button should be disabled
    And the "Move section down" toolbar button should be disabled

  Scenario: First section can only be moved down
    Given there are 2 sections
    And I click the first section
    Then the "Move section up" toolbar button should be disabled
    And the "Move section down" toolbar button should be enabled

  Scenario: Last section can only be moved up
    Given there are 2 sections
    And I click the last section
    Then the "Move section down" toolbar button should be disabled
    And the "Move section up" toolbar button should be enabled

  Scenario: The middle section can be moved both ways
    Given there are 3 sections
    And I click the second section
    Then the "Move section down" toolbar button should be enabled
    And the "Move section up" toolbar button should be enabled

  Scenario: Remove a specific section
    Given there are 2 sections
      | A |
      | B |
    And I click the first section
    And I click the "Remove section" toolbar button
    Then there should be 1 section
    And the preview should show "B"

  Scenario: Move section up
    Given there are 2 sections
      | A |
      | B |
    And I click the second section
    And I click the "Move section up" toolbar button
    Then the first preview section should show "B"
    And the second preview section should show "A"

  Scenario: Move section down
    Given there are 2 sections
      | A |
      | B |
    And I click the first section
    And I click the "Move section down" toolbar button
    Then the first preview section should show "B"
    And the second preview section should show "A"
