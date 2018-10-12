/* global Given, When, Then */
Given(`there is an empty image element`, () => {
  cy.initEditor(`
    <figure class="image"></figure>
  `);
});

Given(`there is an image element`, () => {
  cy.initEditor(`
    <figure class="image">
      <div data-media-uuid="123" data-media-type="image" data-media-display="hero"></div>
      <figcaption>Insert text ...</figcaption>
    </figure>
  `);
});

When(/^I click the "(.*)" image button$/, label => {
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

Given(`there is an empty gallery`, () => {
  cy.initEditor(`
    <element class="gallery">
      <h2></h2>
      <div class="gallery__items"></div>
    </element>
  `);
});

Then(`there should be an empty image`, () => {
  cy.get('@container').within(() => {
    cy.get('figure.image').should('be.visible');
  });
});

When(`I click the first gallery image`, () => {
  cy.get('#editor figure.image').click();
});
