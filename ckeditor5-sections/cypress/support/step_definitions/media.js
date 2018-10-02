/* global Given, When, Then */
Given(`there is an empty image section`, () => {
  cy.window().then(window => {
    window.editor.setData(`
      <div class="root">
        <div class="root-container">
          <figure class="image">
            <div data-media-type="image" data-media-display="hero"/>
            <figcaption>Insert text ...</figcaption>
          </figure>
        </div>
      </div>
    `);
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

Given(`there is an empty gallery`, () => {
  cy.window().then(window => {
    window.editor.setData(`
      <div class="root">
        <div class="root-container">
          <section class="gallery">
            <h2></h2>
            <div>
              <figure class="image">
                <div data-media-type="image" data-media-display="hero"/>
                <figcaption>Insert text ...</figcaption>
              </figure>
            </div>
          </section>
        </div>
      </div>
    `);
  })
});

Then(`there should be an empty image`, () => {
  cy.get('@container').within(() => {
    cy.get('figure.image').should('be.visible');
  });
});

When(`I click the first gallery image`, () => {
  cy.get('#editor figure.image').click();
});
