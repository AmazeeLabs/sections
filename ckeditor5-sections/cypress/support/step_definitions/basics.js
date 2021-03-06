/* global Given, When, Then */

export const clickTheNthElement = position => {
  const selector = {
    first: ':first-child',
    second: ':nth(1)',
    third: ':nth(2)',
    last: ':last-child'
  }[position];

  cy.get('@container').children().filter(selector).as('widget').click();
}

export const clickTheContainerControl = button => {
  const selector = {
    remove: 'button.element-remove',
    configure: 'button.element-configure',
    up: 'button.element-up',
    down: 'button.element-down',
    "next page": 'button.next-page',
    "previous page": 'button.previous-page',
  }[button];
  cy.get(selector).not(`.ck-disabled`).click();
}

Given(`I opened an empty document`, () => {
  cy.initEditor('');
});

Given(/^I opened a document with existing content$/, file => {
  cy.initEditor(`
    <div class="text">
      <h2>Headline 1</h2>
      <div class="content-wrapper">
        <p>Text 1 </p>
      </div>
    </div>
    <div class="text">
      <h2>Headline 2</h2>
      <div class="content-wrapper">
        <p>Text 2 </p>
      </div>
    </div>
  `);


});

Given(/^I click the (first|second|third|last) element$/, (position) => {
  clickTheNthElement(position);
});

Given(/^there (is|are) (no|\d+) elements?$/, (_, number, contents) => {
  const content = Array.from(Array(parseInt(number)).keys()).map(i => {
    return `
      <div class="text">
        <h2></h2>
        <div class="content-wrapper">
          <p>${contents ? contents.raw()[i][0] : ''}</p>
        </div>
      </div>
    `
  }).join('');
  cy.initEditor(content);
});

Given(/^I click "([^"]*)"$/, (text) => {
  cy.get('@widget').within(() => cy.contains(text).as('focus').click());
});

Given(/^I click the textfield "([^"]*)"$/, (text) => {
  cy.get('@widget').within(() => {
    cy.get(`[data-placeholder="${text}"]`).as('editable');
    cy.get('@editable').click();
  });
});

Given(/^I edit the textarea "([^"]*)"$/, (text) => {
  cy.get('@widget').within(() => {
    cy.contains(text).parent().as('editable');
    cy.get('@editable').clear();
  });
});

Given(/^I enter "(.*)"$/, (text) => {
  cy.get('@editable').type(text);
});

Then (/^there should be (\d+)\s?(.*?) elements?$/, (number, type) => {
  if (type) {
    cy.get('@container').children().not('.placeholder-container-element').filter(`.${type}`).should('have.length', number);
  }
  else {
    cy.get('@container').children().not('.placeholder-container-element').should('have.length', number);
  }
});

Then(/^the preview should show "([^"]*)"$/, (text) => {
  cy.get('#preview').contains(text);
});

Then(/^the (first|second|third|last) preview element should show "([^"]*)"$/, (position, text) => {
  const selector = {
    first: ':first-child',
    second: ':nth(1)',
    third: ':nth(2)',
    last: ':last-child'
  }[position];
    cy.get(`.text${selector}`).within(() => {
      cy.contains(text);
    });
});

Then(/^the (remove|configure|up|down|next page|previous page) control should be (disabled|enabled|hidden)$/, (button, state) => {
  const selector = {
    remove: 'button.element-remove',
    configure: 'button.element-configure',
    up: 'button.element-up',
    down: 'button.element-down',
    "next page": 'button.next-page',
    "previous page": 'button.previous-page',
  }[button];
  if (state === 'disabled') {
    cy.get(selector).filter(`.ck-off`);
  }
  else if (state === 'hidden') {
    cy.get(selector).filter('not.be.visible');
  }
  else {
    cy.get(selector).not(`.ck-enabled`);
  }
});

Then(/^the "([^"]*)" toolbar button should be (disabled|enabled|hidden)$/, (text, state) => {
  if (state === 'disabled') {
    cy.get('.placeholder-container-element').contains(text).filter(`.ck-disabled`);
  }
  else if (state === 'hidden') {
    cy.get('.placeholder-container-element').contains(text).should('not.be.visible');
  }
  else {
    cy.get('.placeholder-container-element').contains(text).not(`.ck-enabled`);
  }
});

When(/^I click the "([^"]*)" toolbar button$/, (text) => {
  // target the visible toolbar first.
  cy.get('.placeholder-container-element').contains(text).not(`.ck-disabled`).click();
});

When(/^I click the (remove|configure|up|down|next page|previous page) control$/, (button) => {
  clickTheContainerControl(button);
});

When(/^I click the first image$/, (text) => {
  cy.get('#editor .gallery__images').as('container');
  cy.get('@container').children().filter('.image').click();
});

Then(/^the container control buttons appear$/, () => {
  cy.get('button.element-remove');
  cy.get('button.element-configure');
  cy.get('button.element-up');
  cy.get('button.element-down');
  cy.get('button.next-page');
  cy.get('button.previous-page');
});
