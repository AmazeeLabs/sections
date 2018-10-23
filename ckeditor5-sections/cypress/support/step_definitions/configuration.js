/* global Given, When, Then */

Then(`there should be a configuration button`, () => {
  cy.contains('Configure element').should('be.visible');
});

Given(/^I added an? (Image|Gallery) element$/, (type) => {
  cy.get('@container').children().first().as('widget').click();
  cy.contains('Insert element below').click();
  cy.get('.ck-balloon-panel_visible').contains('Insert ...').click();
  cy.get('.ck-balloon-panel_visible').contains(type).click();
  cy.get('@container').children().last().as('widget').click();
});

Then(`there should be no configuration button`, () => {
  cy.contains('Configure element').should('not.be.visible');
});

Then(/^"(.*)" should be preselected$/, (option) => {
  cy.contains(option).should('be.visible');
});

Then(/^the "(.*)" dropdown should ?(not)? be visible$/, (name, visible) => {
  if (visible) {
    cy.get(name).should('be.visible');
  }
  else {
    cy.get(name).should('not.be.visible');
  }
});

When(/^I choose "(.*)" for the first setting$/, (option) => {
  cy.get('.ck-balloon-panel_visible .ck-dropdown:nth-child(1)').click();
  cy.get('.ck-balloon-panel_visible').contains(option).click();
});

Then(/^"(.*)" remains selected$/, (option) => {
  cy.contains('Configure element').click().click();
  cy.get('.ck-balloon-panel_visible').contains(option).should('be.visible');
});

Then(/^the (first|second|last) preview element has "(.*)" set to "(.*)"$/, (position, attr, value) => {
  cy.get(`#preview [${attr}="${value}"]`);
});