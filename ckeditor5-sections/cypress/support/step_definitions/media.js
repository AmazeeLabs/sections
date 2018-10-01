/* global Given, When, Then */
Given(`there is an empty image section`, () => {
  cy.window().then(window => {
    window.editor.setData('<section class="image"></section>');
  })
});

When(/^I click the "(.*)" button$/, label => {
  cy.get('@widget').within(() => {
    cy.contains(label).click();
  });
});

When(`I wait for the media loading indicator to disappear`, () => {
  cy.get('@widget').within(() => {
    cy.get('.ck-media-loader').should('be.visible');
    cy.get('.ck-media-loader').should('not.exist');
  })
});

Then(`I should see an image preview`, () => {
  cy.get('img').should('be.visible');
});

Then(`the preview contains a media entity`, () => {
  cy.get('#preview div[data-media-type="image"]').should('have.attr', 'data-media-uuid', '123');
  cy.get('#preview div[data-media-type="image"]').should('have.attr', 'data-media-display', 'hero');
});
