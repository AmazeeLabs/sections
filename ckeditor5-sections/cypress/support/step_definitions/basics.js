/* global Given, When, Then */
Given(`I opened an empty document`, () => {
  cy.initEditor('');
});

Given(/^I opened a document with existing content$/, file => {
  cy.initEditor(`
    <div class="text">
      <h2>Headline 1</h2>
      <p>Text 1 </p>
    </div>
    <div class="text">
      <h2>Headline 2</h2>
      <p>Text 2 </p>
    </div>
  `);


});

Given(/^I click the (first|second|third|last) section$/, (position) => {
  const selector = {
    first: ':first-child',
    second: ':nth(1)',
    third: ':nth(2)',
    last: ':last-child'
  }[position];

  cy.get('@container').children().filter(selector)  .as('widget').click();
});

Given(/^there (is|are) (no|\d+) sections?$/, (_, number, contents) => {
  if (contents) {
    debugger;
  }
  const content = Array.from(Array(parseInt(number)).keys()).map(i => {
    return `
      <div class="text">
        <h2></h2>
        <p>${contents ? contents.raw()[i][0] : ''}</p>
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

Given(/^I enter "(.*)"$/, (text) => {
  cy.get('@editable').type(text);
});

Then (/^there should be (\d+)\s?(.*?) sections?$/, (number, type) => {
  if (type) {
    cy.get('@container').children().filter(`.${type}`).should('have.length', number);
  }
  else {
    cy.get('@container').children().should('have.length', number);
  }
});

Then(/^the preview should show "([^"]*)"$/, (text) => {
  cy.get('#preview').contains(text);
});

Then(/^the (first|second|third|last) preview section should show "([^"]*)"$/, (position, text) => {
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

Then(`the section toolbar appears`, () => {
  cy.get('.ck-balloon-panel').should('be.visible');
});

Then(/^the "([^"]*)" toolbar button should be (disabled|enabled|hidden)$/, (text, state) => {
  cy.get('.ck-balloon-panel').within(() => {
    if (state === 'disabled') {
      cy.contains(text).filter(`.ck-disabled`);
    }
    else if (state === 'hidden') {
      cy.contains(text).should('not.be.visible');
    }
    else {
      cy.contains(text).not(`.ck-enabled`);
    }
  });
});


When(/^I click the "([^"]*)" toolbar button$/, (text) => {
  cy.get('.ck-balloon-panel').within(() => {
      cy.contains(text).not(`.ck-disabled`).click();
  });
});

When(/^I click the first image$/, (text) => {
  cy.get('#editor .gallery__images').as('container');
  cy.get('@container').children().filter('.image').click();
});

