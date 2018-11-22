/* global Given, When, Then */

Then(/^the remaining characters counter should show (\d+)$/, (number) => {
  cy.get('.char-limit-count').contains(number);
});

Then(/^the remaining characters counter should be highlighted$/, (number) => {
  cy.get('.char-limit-count').should('have.class', 'limit-exceeded')
});

Then(/^the remaining characters counter should not be highlighted$/, (number) => {
  cy.get('.char-limit-count').should('not.have.class', 'limit-exceeded')
});
