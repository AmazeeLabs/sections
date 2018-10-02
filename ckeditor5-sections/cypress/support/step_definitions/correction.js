/* global Given, When, Then */

Given(`there is a text section with an unexpected h3 element`, () => {
  cy.window().then(window => {
    window.editor.setData(`
    <div class="root">
      <div class="root-container">
        <div class="text">
          <h2>That's ok</h2>
          <h3>That's not ok</h3>
          <p>Thats just the text</p>
        </div>
      </div>
    </div>
    `);
  })
});

Then(`the h3 element is removed`, () => {
  cy.get('#editor h3').should('not.exist');
});

Given(`there is a text section missing the p element`, () => {
  cy.window().then(window => {
    window.editor.setData(`
    <div class="root">
      <div class="root-container">
        <div class="text">
          <h2>That's ok</h2>
        </div>
      </div>
    </div>
    `);
  })
});

Then(`an empty p element is added`, () => {
  cy.get('#editor p').should('exist');
});
