/* global Given, When, Then */

beforeEach(() => {
  cy.visit('./sample/index.html');
  // Make sure the editor is focused.
  cy.get('#editor').as('container').click();
});

Given(`I opened an empty document`, () => {
});

Given(/^I opened a document with content from "(.*)"$/, file => {
  cy.fixture(file).then((content) => {
    cy.window().then(window => window.editor.setData(content));
  });
});

Given(/^I click the (first|second|third|last) section$/, (position) => {
  const selector = {
    first: ':first-child',
    second: ':nth(1)',
    third: ':nth(2)',
    last: ':last-child'
  }[position];

  cy.get('@container').within(() => {
    cy.get(`section${selector}`).as('widget').click();
  });
});

Given(/^there (is|are) (no|\d+) sections?$/, (_, number, contents) => {
  for (let count = 1; count < number; count++) {
    cy.get('@container').within(() => {
      cy.get(`section:last-child`).click();
    });
    cy.contains('Insert ...').click();
    cy.contains('Text').click();
  }
  if (contents) {
    const raw = contents.raw();
    for (let i = 0; i < raw.length; i++) {
      console.log(raw[i][0]);
      cy.get('@container').within(() => {
        cy.get(`section:nth(${i})`).within(() => {
          cy.get('p').type(raw[i][0]);
        })
      });
    }
  }
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
  cy.get('@container').within(() => {
    if (type) {
      cy.get(`section.${type}`).should('have.length', number);
    }
    else {
      cy.get(`section`).should('have.length', number);
    }
  });
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
    cy.get(`section${selector}`).within(() => {
      cy.contains(text);
    });
});

Then(`the section toolbar appears`, () => {
  cy.get('.ck-balloon-panel').should('be.visible');
});

Then(/^the "([^"]*)" toolbar button should be (disabled|enabled)$/, (text, state) => {
  cy.get('.ck-balloon-panel').within(() => {
    if (state === 'disabled') {
      cy.contains(text).filter(`.ck-disabled`);
    }
    else {
      cy.contains(text).not(`.ck-disabled`);
    }
  });
});


When(/^I click the "([^"]*)" toolbar button$/, (text) => {
  cy.get('.ck-balloon-panel').within(() => {
      cy.contains(text).not(`.ck-disabled`).click();
  });
});

