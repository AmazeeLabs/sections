Feature: Containers

  Containers allow to arrange add/remove and arrange elements.

  Scenario: Show the container controls
    Given there is 1 element
    And I click the first element
    Then the container control buttons appear

  Scenario: Prevent removal of the last element
    Given there is 1 element
    And I click the first element
    Then the remove control should be disabled

  Scenario: Prevent nesting root containers
    Given I opened an empty document
    And I click the first element
    Then the "Root" toolbar button should be hidden

  Scenario: Add a element
    Given there is 1 element
    And I click the first element
    And I click the "Text" toolbar button
    Then there should be 2 text elements

  Scenario: A single element can't be moved
    Given there is 1 element
    And I click the first element
    Then the up control should be disabled
    And the down control should be disabled

  Scenario: First element can only be moved down
    Given there are 2 elements
    And I click the first element
    Then the up control should be disabled
    And the down control should be enabled

  Scenario: Last element can only be moved up
    Given there are 2 elements
    And I click the last element
    Then the down control should be disabled
    And the up control should be enabled

  Scenario: The middle element can be moved both ways
    Given there are 3 elements
    And I click the second element
    Then the down control should be enabled
    And the up control should be enabled

  Scenario: Remove a specific element
    Given there are 2 elements
      | A |
      | B |
    And I click the first element
    And I click the remove control
    Then there should be 1 element
    And the preview should show "B"

  Scenario: Move element up
    Given there are 2 elements
      | A |
      | B |
    And I click the second element
    And I click the up control
    Then the first preview element should show "B"
    And the second preview element should show "A"

  Scenario: Move element down
    Given there are 2 elements
      | A |
      | B |
    And I click the first element
    And I click the down control
    Then the first preview element should show "B"
    And the second preview element should show "A"

  Scenario: Insert 3rd level nested elements
    Given I opened an empty document
    And I click the "Nested container" toolbar button
    And I click the second element
    And I edit the textarea "Enter a headline ..."
    And I enter "Test"
    Then the preview should show "Test"