/* global Given, When, Then */

import { clickTheNthElement, clickTheContainerButtonWithText } from './basics';

export const openTheConfigurationPanelForNthElement = position => {
  clickTheNthElement(position);
  clickTheContainerButtonWithText("Configure element");
}

Given(/^I added an? (Image|Gallery) element$/, (type) => {
  cy.get('@container').children().first().as('widget').click();
  cy.contains('Insert element below').click();
  cy.get('.ck-placeholder-widget .ck-button').contains(type).click();
  cy.get('@container').children().last().as('widget').click();
});

When(/^I open the configuration panel of the (.*) element$/, (position) => {
  openTheConfigurationPanelForNthElement(position);
});

When(/^I type "(.*)" into a configuration textfield of the (.*) element$/, (value, position) => {
  openTheConfigurationPanelForNthElement(position);
  cy.get('.ck-input-text').clear().type(value);
});

When(/^I select "(.*)" in a multiselect field of the (.*) element$/, (value, position) => {
  openTheConfigurationPanelForNthElement(position);
  cy.get('.sections-multiselect .ck-dropdown__button').click();
  cy.get('.ck-button__label').contains(value).click();
});

When(/^I choose "(.*)" for the first setting$/, (option) => {
  cy.get('.ck-balloon-panel_visible .ck-dropdown:nth-child(1)').click();
  cy.get('.ck-balloon-panel_visible').contains(option).click();
});

Then(/^the "(.*)" dropdown should ?(not)? be visible$/, (name, visible) => {
  if (visible) {
    cy.get(name).should('be.visible');
  }
  else {
    cy.get(name).should('not.be.visible');
  }
});

Then(`there should be a configuration button`, () => {
  cy.contains('Configure element').should('be.visible');
});

Then(/^a textfield element should have a value of "(.*)"$/, (value) => {
  cy.get('.ck-input-text')
    .should('be.visible')
    .should('have.value', value);
});

Then(/^a multiselect element should have a value of "(.*)"$/, (value) => {
  cy.get('.sections-multiselect .ck-dropdown__button .ck-button__label')
    .should('be.visible')
    .should('contain', value);
});

Then(`there should be no configuration button`, () => {
  cy.contains('Configure element').should('not.be.visible');
});

Then(/^"(.*)" should be preselected$/, (option) => {
  cy.contains(option).should('be.visible');
});

Then(/^"(.*)" remains selected$/, (option) => {
  cy.contains('Configure element').click().click();
  cy.get('.ck-balloon-panel_visible').contains(option).should('be.visible');
});

Then(/^the (first|second|last) preview element has "(.*)" set to "(.*)"$/, (position, attr, value) => {
  cy.get(`#preview [${attr}="${value}"]`);
});

Then(/^a textfield should have a placeholder of "(.*)"$/, (value) => {
  cy.get('.ck-input-text').should('be.visible').should('have.attr', 'placeholder', value);
});
