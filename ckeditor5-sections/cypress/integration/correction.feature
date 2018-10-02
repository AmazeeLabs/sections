Feature: Automatic document correction

  Incorrect documents are automatically corrected. Missing elements are added and unexpected ones removed.

  Scenario: Unexpected element
    Given there is a text section with an unexpected h3 element
    Then the h3 element is removed

  Scenario: Missing element
    Given there is a text section missing the p element
    Then an empty p element is added
#
#  Scenario: Wrong order
#    Given there is a text section with elements p + h2
#    Then the ordering is corrected to h2 + p
#
#  Scenario: Unexpected, missing
#    Given there is a text section with elements h3 + p
#    Then the it is corrected to h2 + p


